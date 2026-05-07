import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { clients, user } from "@/db/schema";
import type { AccessScope } from "@/shared/types";
import type {
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
