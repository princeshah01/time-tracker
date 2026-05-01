import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  permissions,
  rolePermissions,
  roles,
  userRoles,
} from "@/lib/db/schema";

export type RoleRecord = typeof roles.$inferSelect;

export class PermissionsRepository {
  async findRoleByName(name: string) {
    const [role] = await db.select().from(roles).where(eq(roles.name, name));
    return role ?? null;
  }

  async findRoleById(id: number) {
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    return role ?? null;
  }

  async findDefaultRole() {
    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.isDefault, true));
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
      .where(eq(userRoles.userId, userId));
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
