import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  type SQL,
  sql,
} from "drizzle-orm";

import { db } from "@/db";
import {
  projects,
  projectTeamMembers,
  tasks,
  timesheetEntries,
  timesheets,
  timesheetUsers,
  user,
} from "@/db/schema";
import type {
  CreateTimesheetInput,
  ListTimesheetsInput,
  UpdateTimesheetInput,
  UpsertTimesheetSheetInput,
} from "./timesheets.validation";

type CreateTimesheetRecordInput = Pick<
  CreateTimesheetInput,
  "projectId" | "timesheetName" | "userIds"
> & {
  startDate: Date;
  endDate: Date;
  createdBy: string;
};

type UpsertSheetEntryRecordInput = Pick<UpsertTimesheetSheetInput, "taskId"> & {
  timesheetId: number;
  userId: string;
  entryDate: Date;
  minutesSpent: number;
  createdBy: string;
};

type ScopedTimesheetInput = ListTimesheetsInput & {
  requesterId: string;
};

export class TimesheetsRepository {
  async createTimesheet(input: CreateTimesheetRecordInput) {
    return db.transaction(async (tx) => {
      const [timesheet] = await tx
        .insert(timesheets)
        .values({
          projectId: input.projectId,
          timesheetName: input.timesheetName,
          startDate: input.startDate,
          endDate: input.endDate,
          createdBy: input.createdBy,
        })
        .returning();

      if (!timesheet) return null;

      await tx.insert(timesheetUsers).values(
        input.userIds.map((userId) => ({
          timesheetId: timesheet.id,
          userId,
        }))
      );

      return timesheet;
    });
  }

  async listTimesheetsPaginated(input: ScopedTimesheetInput) {
    const page = input.page;
    const limit = input.limit;
    const offset = (page - 1) * limit;
    const whereClause = this.buildVisibleWhere(input);

    const [items, totalResult] = await Promise.all([
      db
        .select(this.timesheetSelectFields())
        .from(timesheets)
        .innerJoin(projects, eq(timesheets.projectId, projects.id))
        .innerJoin(user, eq(timesheets.createdBy, user.id))
        .where(whereClause)
        .orderBy(desc(timesheets.createdAt), asc(timesheets.timesheetName))
        .limit(limit)
        .offset(offset),
      db
        .select({ value: count() })
        .from(timesheets)
        .innerJoin(projects, eq(timesheets.projectId, projects.id))
        .innerJoin(user, eq(timesheets.createdBy, user.id))
        .where(whereClause),
    ]);

    const usersByTimesheetId = await this.listUsersByTimesheetIds(
      items.map((item) => item.id)
    );

    return {
      items: items.map((item) => ({
        ...item,
        users: usersByTimesheetId.get(item.id) ?? [],
      })),
      total: Number(totalResult[0]?.value ?? 0),
      page,
      limit,
    };
  }

  async findTimesheetById(timesheetId: number) {
    const [timesheet] = await db
      .select(this.timesheetSelectFields())
      .from(timesheets)
      .innerJoin(projects, eq(timesheets.projectId, projects.id))
      .innerJoin(user, eq(timesheets.createdBy, user.id))
      .where(eq(timesheets.id, timesheetId))
      .limit(1);

    if (!timesheet) return null;

    const usersByTimesheetId = await this.listUsersByTimesheetIds([
      timesheet.id,
    ]);

    return {
      ...timesheet,
      users: usersByTimesheetId.get(timesheet.id) ?? [],
    };
  }

  async updateTimesheet(timesheetId: number, input: UpdateTimesheetInput) {
    return db.transaction(async (tx) => {
      const hasTimesheetChanges =
        input.projectId !== undefined ||
        input.timesheetName !== undefined ||
        input.startDate !== undefined ||
        input.endDate !== undefined;

      if (hasTimesheetChanges) {
        await tx
          .update(timesheets)
          .set({
            ...(input.projectId !== undefined
              ? { projectId: input.projectId }
              : {}),
            ...(input.timesheetName !== undefined
              ? { timesheetName: input.timesheetName }
              : {}),
            ...(input.startDate !== undefined
              ? { startDate: input.startDate }
              : {}),
            ...(input.endDate !== undefined ? { endDate: input.endDate } : {}),
            updatedAt: new Date(),
          })
          .where(eq(timesheets.id, timesheetId));
      }

      if (input.userIds !== undefined) {
        await tx
          .delete(timesheetUsers)
          .where(eq(timesheetUsers.timesheetId, timesheetId));

        if (input.userIds.length > 0) {
          await tx.insert(timesheetUsers).values(
            input.userIds.map((userId) => ({
              timesheetId,
              userId,
            }))
          );
        }
      }

      return { id: timesheetId };
    });
  }

  async findProjectById(projectId: number) {
    const [project] = await db
      .select({
        id: projects.id,
        name: projects.name,
        isActive: projects.isActive,
      })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    return project ?? null;
  }

  async findProjectMemberRole(projectId: number, userId: string) {
    const [member] = await db
      .select({ role: projectTeamMembers.role })
      .from(projectTeamMembers)
      .where(
        and(
          eq(projectTeamMembers.projectId, projectId),
          eq(projectTeamMembers.userId, userId)
        )
      )
      .limit(1);

    return member?.role ?? null;
  }

  async listProjectMembers(projectId: number) {
    return db
      .select({
        userId: projectTeamMembers.userId,
        role: projectTeamMembers.role,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(projectTeamMembers)
      .innerJoin(user, eq(projectTeamMembers.userId, user.id))
      .where(eq(projectTeamMembers.projectId, projectId))
      .orderBy(
        sql`case ${projectTeamMembers.role}
          when 'manager' then 1
          when 'lead' then 2
          else 3
        end`,
        asc(user.name)
      );
  }

  async hasTimesheetUser(timesheetId: number, userId: string) {
    const [record] = await db
      .select({ id: timesheetUsers.id })
      .from(timesheetUsers)
      .where(
        and(
          eq(timesheetUsers.timesheetId, timesheetId),
          eq(timesheetUsers.userId, userId)
        )
      )
      .limit(1);

    return Boolean(record);
  }

  async listSheetEntriesForRows(input: {
    timesheetId: number;
    userIds: string[];
    entryDates: Date[];
  }) {
    if (input.userIds.length === 0 || input.entryDates.length === 0) {
      return [];
    }

    return db
      .select({
        id: timesheetEntries.id,
        timesheetId: timesheetEntries.timesheetId,
        userId: timesheetEntries.userId,
        entryDate: timesheetEntries.entryDate,
        taskId: timesheetEntries.taskId,
        minutesSpent: timesheetEntries.minutesSpent,
        createdAt: timesheetEntries.createdAt,
        updatedAt: timesheetEntries.updatedAt,
        task: {
          id: tasks.id,
          title: tasks.title,
          status: tasks.status,
        },
      })
      .from(timesheetEntries)
      .leftJoin(tasks, eq(timesheetEntries.taskId, tasks.id))
      .where(
        and(
          eq(timesheetEntries.timesheetId, input.timesheetId),
          inArray(timesheetEntries.userId, input.userIds),
          inArray(timesheetEntries.entryDate, input.entryDates)
        )
      );
  }

  async findSheetEntry(input: {
    timesheetId: number;
    userId: string;
    entryDate: Date;
  }) {
    const [entry] = await db
      .select({
        id: timesheetEntries.id,
        timesheetId: timesheetEntries.timesheetId,
        userId: timesheetEntries.userId,
        entryDate: timesheetEntries.entryDate,
        taskId: timesheetEntries.taskId,
        minutesSpent: timesheetEntries.minutesSpent,
        createdAt: timesheetEntries.createdAt,
        updatedAt: timesheetEntries.updatedAt,
        task: {
          id: tasks.id,
          title: tasks.title,
          status: tasks.status,
        },
      })
      .from(timesheetEntries)
      .leftJoin(tasks, eq(timesheetEntries.taskId, tasks.id))
      .where(
        and(
          eq(timesheetEntries.timesheetId, input.timesheetId),
          eq(timesheetEntries.userId, input.userId),
          eq(timesheetEntries.entryDate, input.entryDate)
        )
      )
      .limit(1);

    return entry ?? null;
  }

  async upsertSheetEntry(input: UpsertSheetEntryRecordInput) {
    const [entry] = await db
      .insert(timesheetEntries)
      .values({
        timesheetId: input.timesheetId,
        userId: input.userId,
        entryDate: input.entryDate,
        taskId: input.taskId ?? null,
        minutesSpent: input.minutesSpent,
        createdBy: input.createdBy,
      })
      .onConflictDoUpdate({
        target: [
          timesheetEntries.timesheetId,
          timesheetEntries.userId,
          timesheetEntries.entryDate,
        ],
        set: {
          taskId: input.taskId ?? null,
          minutesSpent: input.minutesSpent,
          updatedAt: new Date(),
        },
      })
      .returning({ id: timesheetEntries.id });

    return entry ?? null;
  }

  async searchProjectTasks(input: {
    projectId: number;
    q: string;
    limit: number;
  }) {
    const conditions: SQL[] = [
      eq(tasks.projectId, input.projectId),
      inArray(tasks.status, ["todo", "inprogress"]),
    ];
    const q = input.q.trim();

    if (q) {
      conditions.push(ilike(tasks.title, `%${q}%`));
    }

    return db
      .select({
        id: tasks.id,
        projectId: tasks.projectId,
        title: tasks.title,
        status: tasks.status,
      })
      .from(tasks)
      .where(and(...conditions))
      .orderBy(
        q
          ? sql`case when ${tasks.title} ilike ${`${q}%`} then 0 else 1 end`
          : sql`0`,
        asc(tasks.title)
      )
      .limit(input.limit);
  }

  async findFillableTaskById(taskId: number, projectId: number) {
    const [task] = await db
      .select({
        id: tasks.id,
        projectId: tasks.projectId,
        title: tasks.title,
        status: tasks.status,
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.id, taskId),
          eq(tasks.projectId, projectId),
          inArray(tasks.status, ["todo", "inprogress"])
        )
      )
      .limit(1);

    return task ?? null;
  }

  async createTodoTask(input: {
    projectId: number;
    title: string;
    createdBy: string;
  }) {
    const [task] = await db
      .insert(tasks)
      .values({
        projectId: input.projectId,
        title: input.title,
        status: "todo",
        createdBy: input.createdBy,
      })
      .returning({
        id: tasks.id,
        projectId: tasks.projectId,
        title: tasks.title,
        status: tasks.status,
      });

    return task ?? null;
  }

  private async listUsersByTimesheetIds(timesheetIds: number[]) {
    const usersByTimesheetId = new Map<
      number,
      {
        id: string;
        name: string;
        email: string;
        image: string | null;
      }[]
    >();

    if (timesheetIds.length === 0) return usersByTimesheetId;

    const records = await db
      .select({
        timesheetId: timesheetUsers.timesheetId,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(timesheetUsers)
      .innerJoin(user, eq(timesheetUsers.userId, user.id))
      .where(inArray(timesheetUsers.timesheetId, timesheetIds))
      .orderBy(asc(user.name), asc(user.email));

    for (const record of records) {
      const users = usersByTimesheetId.get(record.timesheetId) ?? [];
      users.push(record.user);
      usersByTimesheetId.set(record.timesheetId, users);
    }

    return usersByTimesheetId;
  }

  private timesheetSelectFields() {
    return {
      id: timesheets.id,
      projectId: timesheets.projectId,
      timesheetName: timesheets.timesheetName,
      startDate: timesheets.startDate,
      endDate: timesheets.endDate,
      createdBy: timesheets.createdBy,
      createdAt: timesheets.createdAt,
      updatedAt: timesheets.updatedAt,
      project: {
        id: projects.id,
        name: projects.name,
        isActive: projects.isActive,
      },
      creator: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      userCount: sql<number>`(
        select count(*)::int
        from ${timesheetUsers}
        where ${timesheetUsers.timesheetId} = ${timesheets.id}
      )`,
    };
  }

  private buildVisibleWhere(input: ScopedTimesheetInput) {
    const conditions: SQL[] = [];
    const q = input.q?.trim();
    const projectName = input.projectName?.trim();
    const accessWhere = or(
      eq(timesheets.createdBy, input.requesterId),
      sql`exists (
        select 1 from ${timesheetUsers}
        where ${timesheetUsers.timesheetId} = ${timesheets.id}
          and ${timesheetUsers.userId} = ${input.requesterId}
      )`
    );

    if (accessWhere) conditions.push(accessWhere);

    if (q) {
      const query = `%${q}%`;
      const searchWhere = or(
        ilike(timesheets.timesheetName, query),
        ilike(projects.name, query),
        ilike(user.name, query),
        ilike(user.email, query),
        sql`${timesheets.id}::text ILIKE ${query}`
      );

      if (searchWhere) conditions.push(searchWhere);
    }

    if (input.projectId) {
      conditions.push(eq(timesheets.projectId, input.projectId));
    }

    if (projectName) {
      conditions.push(ilike(projects.name, `%${projectName}%`));
    }

    return and(...conditions);
  }
}
