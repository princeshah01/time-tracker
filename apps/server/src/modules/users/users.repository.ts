import { and, asc, desc, eq, ilike, inArray, ne, or } from "drizzle-orm";

import { db } from "@/db";
import { roles, user, userInvites, userRoles } from "@/db/schema";
import type {
  InvitedUserSearchRecord,
  OnboardedUserSearchRecord,
} from "./users.types";

type SearchOnboardedUsersInput = {
  q: string;
  limit: number;
  excludeUserId?: string;
};

type SearchInvitedUsersInput = {
  q: string;
  limit: number;
  excludeEmail?: string;
};

export class UsersRepository {
  async searchOnboardedUsers(
    input: SearchOnboardedUsersInput
  ): Promise<OnboardedUserSearchRecord[]> {
    const query = `%${input.q}%`;
    const searchWhere = or(ilike(user.name, query), ilike(user.email, query));
    const whereClause = input.excludeUserId
      ? and(searchWhere, ne(user.id, input.excludeUserId))
      : searchWhere;

    return db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: roles.name,
      })
      .from(user)
      .leftJoin(userRoles, eq(userRoles.userId, user.id))
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .where(whereClause)
      .orderBy(asc(user.name), asc(user.email))
      .limit(input.limit);
  }

  async searchInvitedUsers(
    input: SearchInvitedUsersInput
  ): Promise<InvitedUserSearchRecord[]> {
    const query = `%${input.q}%`;
    const searchWhere = or(
      ilike(userInvites.email, query),
      ilike(roles.name, query)
    );
    const whereClause = input.excludeEmail
      ? and(
          searchWhere,
          ne(userInvites.email, input.excludeEmail.toLowerCase())
        )
      : searchWhere;

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
}
