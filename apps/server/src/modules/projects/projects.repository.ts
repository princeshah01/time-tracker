import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import { db } from "@/db";
import { clients, projectTeamMembers, projects, user } from "@/db/schema";
import type { AccessScope } from "@/shared/types";
import type {
  CreateProjectInput,
  ListProjectsInput,
  UpdateProjectInput,
} from "./projects.validation";

type ScopedProjectInput = {
  requesterId: string;
  scope: AccessScope;
};

type TeamMemberWriteInput = {
  userId: string;
  role: "manager" | "lead" | "member";
};

function moneyToDb(value: number | null | undefined) {
  return value === undefined || value === null ? null : value.toFixed(2);
}

export class ProjectsRepository {
  async createProject(
    input: Omit<CreateProjectInput, "totalProjectIncome" | "teamMembers"> & {
      createdBy: string;
      totalProjectIncome?: string | null;
      teamMembers: TeamMemberWriteInput[];
    }
  ) {
    return db.transaction(async (tx) => {
      const [project] = await tx
        .insert(projects)
        .values({
          name: input.name,
          clientId: input.clientId,
          priority: input.priority,
          description: input.description ?? null,
          isActive: input.isActive,
          startDate: input.startDate,
          expectedEndDate: input.expectedEndDate ?? null,
          billingType: input.billingType,
          totalProjectIncome: input.totalProjectIncome ?? null,
          createdBy: input.createdBy,
        })
        .returning();

      if (!project) return null;

      if (input.teamMembers.length > 0) {
        await tx.insert(projectTeamMembers).values(
          input.teamMembers.map((member) => ({
            projectId: project.id,
            userId: member.userId,
            role: member.role,
            hourlyRate: null,
          }))
        );
      }

      return project;
    });
  }

  async listProjectsPaginated(input: ListProjectsInput & ScopedProjectInput) {
    const page = input.page;
    const limit = input.limit;
    const offset = (page - 1) * limit;
    const whereClause = this.buildListWhere(input);

    const [items, totalResult] = await Promise.all([
      db
        .select({
          id: projects.id,
          name: projects.name,
          clientId: projects.clientId,
          clientName: clients.name,
          clientCompany: clients.company,
          priority: projects.priority,
          description: projects.description,
          isActive: projects.isActive,
          startDate: projects.startDate,
          expectedEndDate: projects.expectedEndDate,
          billingType: projects.billingType,
          totalProjectIncome: projects.totalProjectIncome,
          createdBy: projects.createdBy,
          createdAt: projects.createdAt,
          updatedAt: projects.updatedAt,
          creator: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          taskTotal: sql<number>`0`,
          teamMemberTotal: sql<number>`(
            select count(*)::int
            from ${projectTeamMembers}
            where ${projectTeamMembers.projectId} = ${projects.id}
          )`,
          manager: {
            id: sql<string | null>`(
              select ${projectTeamMembers.userId}
              from ${projectTeamMembers}
              where ${projectTeamMembers.projectId} = ${projects.id}
                and ${projectTeamMembers.role} = 'manager'
              limit 1
            )`,
            name: sql<string | null>`(
              select ${user.name}
              from ${projectTeamMembers}
              inner join ${user} on ${user.id} = ${projectTeamMembers.userId}
              where ${projectTeamMembers.projectId} = ${projects.id}
                and ${projectTeamMembers.role} = 'manager'
              limit 1
            )`,
            email: sql<string | null>`(
              select ${user.email}
              from ${projectTeamMembers}
              inner join ${user} on ${user.id} = ${projectTeamMembers.userId}
              where ${projectTeamMembers.projectId} = ${projects.id}
                and ${projectTeamMembers.role} = 'manager'
              limit 1
            )`,
          },
        })
        .from(projects)
        .innerJoin(clients, eq(projects.clientId, clients.id))
        .innerJoin(user, eq(projects.createdBy, user.id))
        .where(whereClause)
        .orderBy(desc(projects.createdAt), asc(projects.name))
        .limit(limit)
        .offset(offset),
      db
        .select({ value: count() })
        .from(projects)
        .innerJoin(clients, eq(projects.clientId, clients.id))
        .innerJoin(user, eq(projects.createdBy, user.id))
        .where(whereClause),
    ]);

    return {
      items,
      total: Number(totalResult[0]?.value ?? 0),
      page,
      limit,
    };
  }

  async findProjectById(projectId: number) {
    const [project] = await db
      .select({
        id: projects.id,
        name: projects.name,
        clientId: projects.clientId,
        priority: projects.priority,
        description: projects.description,
        isActive: projects.isActive,
        startDate: projects.startDate,
        expectedEndDate: projects.expectedEndDate,
        billingType: projects.billingType,
        totalProjectIncome: projects.totalProjectIncome,
        createdBy: projects.createdBy,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        client: {
          id: clients.id,
          name: clients.name,
          company: clients.company,
          email: clients.email,
          isActive: clients.isActive,
        },
        creator: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
      .from(projects)
      .innerJoin(clients, eq(projects.clientId, clients.id))
      .innerJoin(user, eq(projects.createdBy, user.id))
      .where(eq(projects.id, projectId))
      .limit(1);

    return project ?? null;
  }

  async findClientById(clientId: number) {
    const [client] = await db
      .select({
        id: clients.id,
        isActive: clients.isActive,
      })
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    return client ?? null;
  }

  async listTeamMembers(projectId: number) {
    return db
      .select({
        id: projectTeamMembers.id,
        projectId: projectTeamMembers.projectId,
        userId: projectTeamMembers.userId,
        role: projectTeamMembers.role,
        hourlyRate: projectTeamMembers.hourlyRate,
        createdAt: projectTeamMembers.createdAt,
        updatedAt: projectTeamMembers.updatedAt,
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

  async updateProject(
    projectId: number,
    input: Omit<UpdateProjectInput, "teamMembers"> & {
      teamMembers?: TeamMemberWriteInput[];
    }
  ) {
    return db.transaction(async (tx) => {
      const hasProjectChanges =
        input.name !== undefined ||
        input.clientId !== undefined ||
        input.priority !== undefined ||
        input.description !== undefined ||
        input.isActive !== undefined ||
        input.startDate !== undefined ||
        input.expectedEndDate !== undefined ||
        input.billingType !== undefined;

      let project: { id: number } | null = null;

      if (hasProjectChanges) {
        const [updatedProject] = await tx
          .update(projects)
          .set({
            ...(input.name !== undefined ? { name: input.name } : {}),
            ...(input.clientId !== undefined
              ? { clientId: input.clientId }
              : {}),
            ...(input.priority !== undefined
              ? { priority: input.priority }
              : {}),
            ...(input.description !== undefined
              ? { description: input.description }
              : {}),
            ...(input.isActive !== undefined
              ? { isActive: input.isActive }
              : {}),
            ...(input.startDate !== undefined
              ? { startDate: input.startDate }
              : {}),
            ...(input.expectedEndDate !== undefined
              ? { expectedEndDate: input.expectedEndDate }
              : {}),
            ...(input.billingType !== undefined
              ? { billingType: input.billingType }
              : {}),
            updatedAt: new Date(),
          })
          .where(eq(projects.id, projectId))
          .returning();

        project = updatedProject ?? null;
      }

      if (input.teamMembers) {
        const existingTeamMembers = await tx
          .select({
            userId: projectTeamMembers.userId,
            hourlyRate: projectTeamMembers.hourlyRate,
          })
          .from(projectTeamMembers)
          .where(eq(projectTeamMembers.projectId, projectId));
        const existingRatesByUserId = new Map(
          existingTeamMembers.map((member) => [
            member.userId,
            member.hourlyRate,
          ])
        );

        await tx
          .delete(projectTeamMembers)
          .where(eq(projectTeamMembers.projectId, projectId));

        if (input.teamMembers.length > 0) {
          await tx.insert(projectTeamMembers).values(
            input.teamMembers.map((member) => ({
              projectId,
              userId: member.userId,
              role: member.role,
              hourlyRate: existingRatesByUserId.get(member.userId) ?? null,
            }))
          );
        }
      }

      return project ?? { id: projectId };
    });
  }

  async updateProjectBilling(
    projectId: number,
    input: {
      totalProjectIncome?: string | null;
      teamMembers?: { userId: string; hourlyRate?: string | null }[];
    }
  ) {
    await db.transaction(async (tx) => {
      if (input.totalProjectIncome !== undefined) {
        await tx
          .update(projects)
          .set({
            totalProjectIncome: input.totalProjectIncome,
            updatedAt: new Date(),
          })
          .where(eq(projects.id, projectId));
      }

      if (input.teamMembers) {
        for (const member of input.teamMembers) {
          await tx
            .update(projectTeamMembers)
            .set({
              hourlyRate: member.hourlyRate ?? null,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(projectTeamMembers.projectId, projectId),
                eq(projectTeamMembers.userId, member.userId)
              )
            );
        }
      }
    });
  }

  async findExistingUserIds(userIds: string[]) {
    if (userIds.length === 0) return [];

    return db
      .select({ id: user.id })
      .from(user)
      .where(inArray(user.id, userIds));
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

  private buildListWhere(input: ListProjectsInput & ScopedProjectInput) {
    const conditions: SQL[] = [];
    const q = input.q?.trim();

    if (input.scope === "own") {
      const ownAccess = or(
        eq(projects.createdBy, input.requesterId),
        sql`exists (
          select 1 from ${projectTeamMembers}
          where ${projectTeamMembers.projectId} = ${projects.id}
            and ${projectTeamMembers.userId} = ${input.requesterId}
        )`
      );

      if (ownAccess) conditions.push(ownAccess);
    }

    if (q) {
      const query = `%${q}%`;
      const searchWhere = or(
        ilike(projects.name, query),
        ilike(projects.description, query),
        ilike(clients.name, query),
        ilike(clients.company, query),
        ilike(user.name, query),
        ilike(user.email, query),
        sql`${projects.id}::text ILIKE ${query}`
      );

      if (searchWhere) conditions.push(searchWhere);
    }

    if (input.status === "active") {
      conditions.push(eq(projects.isActive, true));
    }

    if (input.status === "inactive") {
      conditions.push(eq(projects.isActive, false));
    }

    if (input.priority) {
      conditions.push(eq(projects.priority, input.priority));
    }

    if (input.billingType) {
      conditions.push(eq(projects.billingType, input.billingType));
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }
}

export { moneyToDb };
