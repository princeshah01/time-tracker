import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  or,
  type SQL,
  sql,
} from "drizzle-orm";

import { db } from "@/db";
import { projects, projectTeamMembers, tasks, user } from "@/db/schema";
import type { AccessScope } from "@/shared/types";
import type {
  CreateTaskInput,
  ListTasksInput,
  UpdateTaskInput,
} from "./tasks.validation";

type ScopedTaskInput = {
  requesterId: string;
  scope: AccessScope;
};

export class TasksRepository {
  async createTask(input: CreateTaskInput & { createdBy: string }) {
    const [task] = await db
      .insert(tasks)
      .values({
        projectId: input.projectId,
        title: input.title,
        description: input.description ?? null,
        status: input.status,
        createdBy: input.createdBy,
      })
      .returning();

    return task ?? null;
  }

  async listTasksPaginated(input: ListTasksInput & ScopedTaskInput) {
    const page = input.page;
    const limit = input.limit;
    const offset = (page - 1) * limit;
    const whereClause = this.buildListWhere(input);

    const [items, totalResult] = await Promise.all([
      db
        .select(this.taskSelectFields())
        .from(tasks)
        .innerJoin(projects, eq(tasks.projectId, projects.id))
        .innerJoin(user, eq(tasks.createdBy, user.id))
        .where(whereClause)
        .orderBy(desc(tasks.createdAt), asc(tasks.title))
        .limit(limit)
        .offset(offset),
      db
        .select({ value: count() })
        .from(tasks)
        .innerJoin(projects, eq(tasks.projectId, projects.id))
        .innerJoin(user, eq(tasks.createdBy, user.id))
        .where(whereClause),
    ]);

    return {
      items,
      total: Number(totalResult[0]?.value ?? 0),
      page,
      limit,
    };
  }

  async findTaskById(taskId: number) {
    const [task] = await db
      .select(this.taskSelectFields())
      .from(tasks)
      .innerJoin(projects, eq(tasks.projectId, projects.id))
      .innerJoin(user, eq(tasks.createdBy, user.id))
      .where(eq(tasks.id, taskId))
      .limit(1);

    return task ?? null;
  }

  async updateTask(taskId: number, input: UpdateTaskInput) {
    const [task] = await db
      .update(tasks)
      .set({
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined
          ? { description: input.description ?? null }
          : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return task ?? null;
  }

  async findProjectById(projectId: number) {
    const [project] = await db
      .select({
        id: projects.id,
        createdBy: projects.createdBy,
      })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    return project ?? null;
  }

  async hasProjectMembership(projectId: number, userId: string) {
    const [record] = await db
      .select({ id: projectTeamMembers.id })
      .from(projectTeamMembers)
      .where(
        and(
          eq(projectTeamMembers.projectId, projectId),
          eq(projectTeamMembers.userId, userId)
        )
      )
      .limit(1);

    return Boolean(record);
  }

  private taskSelectFields() {
    return {
      id: tasks.id,
      projectId: tasks.projectId,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      createdBy: tasks.createdBy,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
      project: {
        id: projects.id,
        name: projects.name,
        createdBy: projects.createdBy,
      },
      creator: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    };
  }

  private buildListWhere(input: ListTasksInput & ScopedTaskInput) {
    const conditions: SQL[] = [];
    const q = input.q?.trim();

    if (input.scope === "own") {
      const ownAccess = or(
        eq(projects.createdBy, input.requesterId),
        sql`exists (
          select 1 from ${projectTeamMembers}
          where ${projectTeamMembers.projectId} = ${tasks.projectId}
            and ${projectTeamMembers.userId} = ${input.requesterId}
        )`
      );

      if (ownAccess) conditions.push(ownAccess);
    }

    if (q) {
      const query = `%${q}%`;
      const searchWhere = or(
        ilike(tasks.title, query),
        ilike(tasks.description, query),
        ilike(projects.name, query),
        ilike(user.name, query),
        ilike(user.email, query),
        sql`${tasks.id}::text ILIKE ${query}`
      );

      if (searchWhere) conditions.push(searchWhere);
    }

    if (input.projectId) {
      conditions.push(eq(tasks.projectId, input.projectId));
    }

    if (input.status) {
      conditions.push(eq(tasks.status, input.status));
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }
}
