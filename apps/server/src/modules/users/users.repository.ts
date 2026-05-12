import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  lte,
  ne,
  or,
  sql,
} from "drizzle-orm";

import { db } from "@/db";
import { roles, user, userInvites, userRoles, userSkills } from "@/db/schema";
import { roleNames } from "@/shared/constants/role-permission";
import type {
  InvitedUserSearchRecord,
  OnboardedUserSearchRecord,
  SkillUserSearchRecord,
} from "./users.types";
import type { ListUsersInput, UpdateUserInput } from "./users.validation";

type SearchOnboardedUsersInput = {
  q: string;
  limit: number;
  excludeUserId?: string;
  activeOnly?: boolean;
  projectAssignmentRole?: "manager" | "lead" | "member" | "employee";
};

type SearchInvitedUsersInput = {
  q: string;
  limit: number;
  excludeEmail?: string;
};

export class UsersRepository {
  async findUserById(userId: string) {
    const [record] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        role: {
          id: roles.id,
          name: roles.name,
          description: roles.description,
          level: roles.level,
        },
      })
      .from(user)
      .leftJoin(userRoles, eq(userRoles.userId, user.id))
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(user.id, userId))
      .limit(1);

    return record ?? null;
  }

  async listUsersPaginated(
    input: ListUsersInput,
    currentUserId: string,
    maxRoleLevel: number
  ) {
    const page = input.page;
    const limit = input.limit;
    const offset = (page - 1) * limit;
    const whereClause = and(
      this.buildListWhere(input),
      ne(user.id, currentUserId),
      this.roleLevelWhere(maxRoleLevel)
    );

    const [items, totalResult] = await Promise.all([
      db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          role: {
            id: roles.id,
            name: roles.name,
            description: roles.description,
            level: roles.level,
          },
        })
        .from(user)
        .leftJoin(userRoles, eq(userRoles.userId, user.id))
        .leftJoin(roles, eq(userRoles.roleId, roles.id))
        .where(whereClause)
        .orderBy(desc(user.createdAt), asc(user.name))
        .limit(limit)
        .offset(offset),
      db
        .select({ value: count() })
        .from(user)
        .leftJoin(userRoles, eq(userRoles.userId, user.id))
        .leftJoin(roles, eq(userRoles.roleId, roles.id))
        .where(whereClause),
    ]);

    return {
      items,
      total: Number(totalResult[0]?.value ?? 0),
      page,
      limit,
    };
  }

  async updateUser(
    userId: string,
    input: Pick<UpdateUserInput, "isActive" | "name">
  ) {
    if (input.isActive === undefined && input.name === undefined) {
      return this.findUserById(userId);
    }

    const [record] = await db
      .update(user)
      .set({
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning();

    return record ?? null;
  }

  async replaceUserRole(userId: string, roleId: number | null) {
    await db.transaction(async (tx) => {
      await tx.delete(userRoles).where(eq(userRoles.userId, userId));

      if (roleId) {
        await tx
          .insert(userRoles)
          .values({ userId, roleId })
          .onConflictDoNothing();
      }
    });
  }

  async listSkillsByUserIds(userIds: string[]) {
    if (userIds.length === 0) return [];

    return db
      .select({
        userId: userSkills.userId,
        name: userSkills.name,
      })
      .from(userSkills)
      .where(inArray(userSkills.userId, userIds))
      .orderBy(asc(userSkills.name));
  }

  async replaceUserSkills(userId: string, skills: string[]) {
    await db.transaction(async (tx) => {
      await tx.delete(userSkills).where(eq(userSkills.userId, userId));

      if (skills.length === 0) return;

      await tx
        .insert(userSkills)
        .values(
          skills.map((name) => ({
            userId,
            name,
          }))
        )
        .onConflictDoNothing();
    });
  }

  async searchOnboardedUsers(
    input: SearchOnboardedUsersInput & { maxRoleLevel: number }
  ): Promise<OnboardedUserSearchRecord[]> {
    const query = `%${input.q}%`;
    const searchWhere = or(ilike(user.name, query), ilike(user.email, query));
    const whereClause = and(
      searchWhere,
      input.excludeUserId ? ne(user.id, input.excludeUserId) : undefined,
      input.activeOnly ? eq(user.isActive, true) : undefined,
      this.roleLevelWhere(input.maxRoleLevel),
      this.projectAssignmentRoleWhere(input.projectAssignmentRole)
    );

    return db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: roles.name,
      })
      .from(user)
      .leftJoin(userRoles, eq(userRoles.userId, user.id))
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .where(whereClause)
      .orderBy(asc(user.name), asc(user.email))
      .limit(input.limit);
  }

  async searchUsersBySkills(
    input: SearchOnboardedUsersInput & { maxRoleLevel: number }
  ): Promise<SkillUserSearchRecord[]> {
    const query = `%${input.q}%`;
    const searchWhere = or(
      ilike(userSkills.name, query),
      ilike(user.name, query),
      ilike(user.email, query)
    );
    const whereClause = and(
      searchWhere,
      input.excludeUserId ? ne(user.id, input.excludeUserId) : undefined,
      eq(user.isActive, true),
      this.roleLevelWhere(input.maxRoleLevel)
    );

    return db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: roles.name,
        skill: userSkills.name,
      })
      .from(userSkills)
      .innerJoin(user, eq(userSkills.userId, user.id))
      .leftJoin(userRoles, eq(userRoles.userId, user.id))
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .where(whereClause)
      .orderBy(asc(user.name), asc(userSkills.name))
      .limit(input.limit);
  }

  async searchInvitedUsers(
    input: SearchInvitedUsersInput & { maxRoleLevel: number }
  ): Promise<InvitedUserSearchRecord[]> {
    const query = `%${input.q}%`;
    const searchWhere = or(
      ilike(userInvites.email, query),
      ilike(roles.name, query)
    );
    const whereClause = and(
      searchWhere,
      input.excludeEmail
        ? ne(userInvites.email, input.excludeEmail.toLowerCase())
        : undefined,
      lte(roles.level, input.maxRoleLevel)
    );

    return db
      .select({
        id: userInvites.id,
        email: userInvites.email,
        role: roles.name,
        acceptedAt: userInvites.acceptedAt,
        revokedAt: userInvites.revokedAt,
        expiresAt: userInvites.expiresAt,
      })
      .from(userInvites)
      .innerJoin(roles, eq(userInvites.roleId, roles.id))
      .where(whereClause)
      .orderBy(desc(userInvites.createdAt))
      .limit(input.limit);
  }

  async findExistingUserEmails(emails: string[]) {
    if (emails.length === 0) return [];

    return db
      .select({ email: user.email })
      .from(user)
      .where(
        inArray(
          user.email,
          emails.map((email) => email.toLowerCase())
        )
      );
  }

  private buildListWhere(input: ListUsersInput) {
    const conditions = [];
    const q = input.q?.trim();
    const role = input.role?.trim();

    if (q) {
      const query = `%${q}%`;
      conditions.push(
        or(
          ilike(user.id, query),
          ilike(user.name, query),
          ilike(user.email, query),
          ilike(roles.name, query),
          sql`exists (
            select 1 from ${userSkills}
            where ${userSkills.userId} = ${user.id}
              and ${userSkills.name} ilike ${query}
          )`
        )
      );
    }

    if (input.status === "active") {
      conditions.push(eq(user.isActive, true));
    }

    if (input.status === "inactive") {
      conditions.push(eq(user.isActive, false));
    }

    if (role) {
      const roleId = Number(role);
      conditions.push(
        Number.isInteger(roleId) && roleId > 0
          ? eq(roles.id, roleId)
          : ilike(roles.name, role)
      );
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  private roleLevelWhere(maxRoleLevel: number) {
    return or(isNull(roles.level), lte(roles.level, maxRoleLevel));
  }

  private projectAssignmentRoleWhere(
    projectAssignmentRole?: "manager" | "lead" | "member" | "employee"
  ) {
    if (projectAssignmentRole === "manager") {
      return eq(roles.name, roleNames.manager);
    }

    if (projectAssignmentRole === "lead") {
      return eq(roles.name, roleNames.teamLead);
    }

    if (
      projectAssignmentRole === "member" ||
      projectAssignmentRole === "employee"
    ) {
      return lte(roles.level, 80);
    }

    return undefined;
  }
}
