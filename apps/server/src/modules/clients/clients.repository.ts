import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import { db } from "@/db";
import { clients, projectTeamMembers, projects, user } from "@/db/schema";
import type { AccessScope } from "@/shared/types";
import type {
  AutocompleteClientsInput,
  CreateClientInput,
  ListClientsInput,
  UpdateClientInput,
} from "./clients.validation";

type ScopedClientInput = {
  requesterId: string;
  scope: AccessScope;
};

export class ClientsRepository {
  async createClient(input: CreateClientInput & { createdBy: string }) {
    const [client] = await db
      .insert(clients)
      .values({
        name: input.name,
        company: input.company ?? null,
        email: input.email,
        phone: input.phone ?? null,
        address: input.address ?? null,
        isActive: input.isActive,
        createdBy: input.createdBy,
      })
      .returning();

    return client ?? null;
  }

  async findClientById(clientId: number) {
    const [client] = await db
      .select({
        id: clients.id,
        name: clients.name,
        company: clients.company,
        email: clients.email,
        phone: clients.phone,
        address: clients.address,
        isActive: clients.isActive,
        createdBy: clients.createdBy,
        createdAt: clients.createdAt,
        updatedAt: clients.updatedAt,
        projectTotal: sql<number>`(
          select count(*)::int
          from ${projects}
          where ${projects.clientId} = ${clients.id}
        )`,
        creator: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
      .from(clients)
      .innerJoin(user, eq(clients.createdBy, user.id))
      .where(eq(clients.id, clientId))
      .limit(1);

    return client ?? null;
  }

  async listClientsPaginated(input: ListClientsInput & ScopedClientInput) {
    const page = input.page;
    const limit = input.limit;
    const offset = (page - 1) * limit;
    const whereClause = this.buildListWhere(input);

    const [items, totalResult] = await Promise.all([
      db
        .select({
          id: clients.id,
          name: clients.name,
          company: clients.company,
          email: clients.email,
          phone: clients.phone,
          address: clients.address,
          isActive: clients.isActive,
          createdBy: clients.createdBy,
          createdAt: clients.createdAt,
          updatedAt: clients.updatedAt,
          projectTotal: sql<number>`(
            select count(*)::int
            from ${projects}
            where ${projects.clientId} = ${clients.id}
          )`,
          creator: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        })
        .from(clients)
        .innerJoin(user, eq(clients.createdBy, user.id))
        .where(whereClause)
        .orderBy(desc(clients.createdAt), asc(clients.name))
        .limit(limit)
        .offset(offset),
      db
        .select({ value: count() })
        .from(clients)
        .innerJoin(user, eq(clients.createdBy, user.id))
        .where(whereClause),
    ]);

    return {
      items,
      total: Number(totalResult[0]?.value ?? 0),
      page,
      limit,
    };
  }

  async updateClient(clientId: number, input: UpdateClientInput) {
    const [client] = await db
      .update(clients)
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.company !== undefined ? { company: input.company } : {}),
        ...(input.email !== undefined ? { email: input.email } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.address !== undefined ? { address: input.address } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        updatedAt: new Date(),
      })
      .where(eq(clients.id, clientId))
      .returning();

    return client ?? null;
  }

  async autocompleteClients(
    input: AutocompleteClientsInput & ScopedClientInput
  ) {
    const conditions: SQL[] = [eq(clients.isActive, true)];
    const q = input.q?.trim();

    if (input.scope === "own") {
      conditions.push(eq(clients.createdBy, input.requesterId));
    }

    if (q) {
      const query = `%${q}%`;
      const searchWhere = or(
        ilike(clients.name, query),
        ilike(clients.company, query),
        ilike(clients.email, query),
        sql`${clients.id}::text ILIKE ${query}`
      );

      if (searchWhere) conditions.push(searchWhere);
    }

    return db
      .select({
        label: clients.name,
        value: clients.id,
      })
      .from(clients)
      .where(and(...conditions))
      .orderBy(asc(clients.name))
      .limit(5);
  }

  async listClientProjects(input: {
    clientId: number;
    requesterId: string;
    scope: AccessScope;
  }) {
    const conditions: SQL[] = [eq(projects.clientId, input.clientId)];

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

    return db
      .select({
        id: projects.id,
        name: projects.name,
        priority: projects.priority,
        status: sql<string>`case when ${projects.isActive} then 'active' else 'inactive' end`,
        billingType: projects.billingType,
        startDate: projects.startDate,
        expectedEndDate: projects.expectedEndDate,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .where(and(...conditions))
      .orderBy(desc(projects.updatedAt), asc(projects.name));
  }

  private buildListWhere(input: ListClientsInput & ScopedClientInput) {
    const conditions = [];
    const q = input.q?.trim();

    if (input.scope === "own") {
      conditions.push(eq(clients.createdBy, input.requesterId));
    }

    if (q) {
      const query = `%${q}%`;
      conditions.push(
        or(
          ilike(clients.name, query),
          ilike(clients.company, query),
          ilike(clients.email, query),
          ilike(clients.phone, query),
          ilike(clients.address, query),
          ilike(user.name, query),
          ilike(user.email, query),
          sql`${clients.id}::text ILIKE ${query}`
        )
      );
    }

    if (input.status === "active") {
      conditions.push(eq(clients.isActive, true));
    }

    if (input.status === "inactive") {
      conditions.push(eq(clients.isActive, false));
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }
}
