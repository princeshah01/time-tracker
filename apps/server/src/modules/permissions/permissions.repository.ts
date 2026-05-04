import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { permissions, rolePermissions, roles, userRoles } from "@/db/schema";

export type RoleRecord = typeof roles.$inferSelect;

export class PermissionsRepository {
  async findRoleByName(name: string) {
    const [role] = await db
      .select()
      .from(roles)
      .where(and(eq(roles.name, name), eq(roles.isActive, true)));
    return role ?? null;
  }

  async findRoleById(id: number) {
    const [role] = await db
      .select()
      .from(roles)
      .where(and(eq(roles.id, id), eq(roles.isActive, true)));
    return role ?? null;
  }

  async findDefaultRole() {
    const [role] = await db
      .select()
      .from(roles)
      .where(and(eq(roles.isDefault, true), eq(roles.isActive, true)));
    return role ?? null;
  }

  async findUserRoles(userId: string) {
    return db
      .select({
        id: roles.id,
        name: roles.name,
        description: roles.description,
        isDefault: roles.isDefault,
        createdAt: roles.createdAt,
        updatedAt: roles.updatedAt,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(and(eq(userRoles.userId, userId), eq(roles.isActive, true)));
  }

  async findPermissionsForRoleIds(roleIds: number[]) {
    if (roleIds.length === 0) {
      return [];
    }

    return db
      .select({
        key: permissions.key,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(inArray(rolePermissions.roleId, roleIds));
  }

  async userHasRole(userId: string, roleId: number) {
    const [record] = await db
      .select({ id: userRoles.id })
      .from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));

    return Boolean(record);
  }

  async clearUserRoles(userId: string) {
    await db.delete(userRoles).where(eq(userRoles.userId, userId));
  }

  async insertUserRole(userId: string, roleId: number) {
    await db
      .insert(userRoles)
      .values({
        userId,
        roleId,
      })
      .onConflictDoNothing();
  }
}
