import { and, asc, count, eq, ilike, inArray, not, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { permissions, rolePermissions, roles, userRoles } from "@/db/schema";
import { roleNames } from "@/shared/constants/role-permission";

export class RolesRepository {
  async findActiveRoleByName(name: string, excludeRoleId?: number) {
    const whereClause = excludeRoleId
      ? and(
          eq(roles.name, name),
          eq(roles.isActive, true),
          not(eq(roles.id, excludeRoleId))
        )
      : and(eq(roles.name, name), eq(roles.isActive, true));

    const [role] = await db.select().from(roles).where(whereClause);
    return role ?? null;
  }

  async findRoleById(roleId: number) {
    const [role] = await db.select().from(roles).where(eq(roles.id, roleId));
    return role ?? null;
  }

  async listRoles() {
    return db.select().from(roles).orderBy(asc(roles.id));
  }

  async listAssignableRoles() {
    return db
      .select({
        label: roles.name,
        value: roles.id,
      })
      .from(roles)
      .where(and(eq(roles.isActive, true), not(eq(roles.name, roleNames.admin))))
      .orderBy(asc(roles.name));
  }

  async listRolesPaginated(input: { page: number; limit: number; q?: string }) {
    const page = input.page;
    const limit = input.limit;
    const offset = (page - 1) * limit;
    const q = (input.q ?? "").trim();
    const whereClause = q
      ? or(
          ilike(roles.name, `%${q}%`),
          ilike(roles.description, `%${q}%`),
          sql`${roles.id}::text ILIKE ${`%${q}%`}`
        )
      : undefined;

    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(roles)
        .where(whereClause)
        .orderBy(asc(roles.id))
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(roles).where(whereClause),
    ]);

    return {
      items,
      total: Number(totalResult[0]?.value ?? 0),
      page,
      limit,
    };
  }

  async createRole(input: { name: string; description?: string | null }) {
    const [role] = await db
      .insert(roles)
      .values({
        name: input.name,
        description: input.description ?? null,
      })
      .returning();

    return role ?? null;
  }

  async updateRole(
    roleId: number,
    input: { name?: string; description?: string | null; isActive?: boolean }
  ) {
    const [role] = await db
      .update(roles)
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        updatedAt: new Date(),
      })
      .where(eq(roles.id, roleId))
      .returning();

    return role ?? null;
  }

  async listAllPermissions() {
    return db.select().from(permissions).orderBy(asc(permissions.key));
  }

  async listRolePermissionKeys(roleId: number) {
    const rows = await db
      .select({
        key: permissions.key,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId));

    return rows.map((row) => row.key);
  }

  async findPermissionsByKeys(keys: string[]) {
    if (keys.length === 0) return [];

    return db.select().from(permissions).where(inArray(permissions.key, keys));
  }

  async replaceRolePermissions(roleId: number, permissionIds: number[]) {
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

    if (permissionIds.length === 0) return;

    await db
      .insert(rolePermissions)
      .values(
        permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        }))
      )
      .onConflictDoNothing();
  }

  async countUsersByRoleId(roleId: number) {
    const rows = await db
      .select({ id: userRoles.id })
      .from(userRoles)
      .where(eq(userRoles.roleId, roleId));

    return rows.length;
  }

  async listPermissionCountsByRoleIds(roleIds: number[]) {
    if (roleIds.length === 0) return [];

    return db
      .select({
        roleId: rolePermissions.roleId,
        count: count(),
      })
      .from(rolePermissions)
      .where(inArray(rolePermissions.roleId, roleIds))
      .groupBy(rolePermissions.roleId);
  }
}
