import { randomUUID } from "node:crypto";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  ilike,
  isNotNull,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";

import { db } from "@/db";
import { account, roles, user, userInvites, userRoles } from "@/db/schema";
import type { InvitationStatus } from "./invitations.types";

export type InvitationRecord = typeof userInvites.$inferSelect;

export class InvitationsRepository {
  async createInvitation(input: {
    email: string;
    roleId: number;
    tokenHash: string;
    invitedBy: string;
    expiresAt: Date;
  }) {
    const [invitation] = await db.insert(userInvites).values(input).returning();

    return invitation ?? null;
  }

  async findActiveInvitationByEmail(email: string) {
    const [invitation] = await db
      .select()
      .from(userInvites)
      .where(
        and(
          eq(userInvites.email, email),
          isNull(userInvites.acceptedAt),
          isNull(userInvites.revokedAt),
          gt(userInvites.expiresAt, new Date())
        )
      )
      .orderBy(desc(userInvites.createdAt))
      .limit(1);

    return invitation ?? null;
  }

  async findInvitationByTokenHash(tokenHash: string) {
    const [invitation] = await db
      .select({
        id: userInvites.id,
        email: userInvites.email,
        roleId: userInvites.roleId,
        tokenHash: userInvites.tokenHash,
        invitedBy: userInvites.invitedBy,
        expiresAt: userInvites.expiresAt,
        otpHash: userInvites.otpHash,
        otpExpiresAt: userInvites.otpExpiresAt,
        otpSentAt: userInvites.otpSentAt,
        otpAttempts: userInvites.otpAttempts,
        otpVerifiedAt: userInvites.otpVerifiedAt,
        acceptedAt: userInvites.acceptedAt,
        revokedAt: userInvites.revokedAt,
        createdAt: userInvites.createdAt,
        updatedAt: userInvites.updatedAt,
        roleName: roles.name,
        roleDescription: roles.description,
      })
      .from(userInvites)
      .innerJoin(roles, eq(userInvites.roleId, roles.id))
      .where(eq(userInvites.tokenHash, tokenHash));

    return invitation ?? null;
  }

  async findInvitationById(invitationId: number) {
    const [invitation] = await db
      .select()
      .from(userInvites)
      .where(eq(userInvites.id, invitationId));

    return invitation ?? null;
  }

  async setInvitationOtp(input: {
    invitationId: number;
    otpHash: string;
    otpExpiresAt: Date;
  }) {
    const [invitation] = await db
      .update(userInvites)
      .set({
        otpHash: input.otpHash,
        otpExpiresAt: input.otpExpiresAt,
        otpSentAt: new Date(),
        otpAttempts: 0,
        otpVerifiedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(userInvites.id, input.invitationId))
      .returning();

    return invitation ?? null;
  }

  async incrementOtpAttempts(invitationId: number) {
    await db
      .update(userInvites)
      .set({
        otpAttempts: sql`${userInvites.otpAttempts} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(userInvites.id, invitationId));
  }

  async markOtpVerified(invitationId: number) {
    const [invitation] = await db
      .update(userInvites)
      .set({
        otpVerifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userInvites.id, invitationId))
      .returning();

    return invitation ?? null;
  }

  async listInvitations(input: {
    page: number;
    limit: number;
    q?: string;
    status?: InvitationStatus;
  }) {
    const page = input.page;
    const limit = input.limit;
    const offset = (page - 1) * limit;
    const whereClause = this.buildListWhere(input);

    const [items, totalResult] = await Promise.all([
      db
        .select({
          id: userInvites.id,
          email: userInvites.email,
          expiresAt: userInvites.expiresAt,
          acceptedAt: userInvites.acceptedAt,
          revokedAt: userInvites.revokedAt,
          createdAt: userInvites.createdAt,
          role: {
            id: roles.id,
            name: roles.name,
            description: roles.description,
          },
          invitedBy: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        })
        .from(userInvites)
        .innerJoin(roles, eq(userInvites.roleId, roles.id))
        .leftJoin(user, eq(userInvites.invitedBy, user.id))
        .where(whereClause)
        .orderBy(desc(userInvites.createdAt), asc(userInvites.id))
        .limit(limit)
        .offset(offset),
      db
        .select({ value: count() })
        .from(userInvites)
        .innerJoin(roles, eq(userInvites.roleId, roles.id))
        .leftJoin(user, eq(userInvites.invitedBy, user.id))
        .where(whereClause),
    ]);

    return {
      items,
      total: Number(totalResult[0]?.value ?? 0),
      page,
      limit,
    };
  }

  async revokeInvitation(invitationId: number) {
    const [invitation] = await db
      .update(userInvites)
      .set({
        revokedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userInvites.id, invitationId),
          isNull(userInvites.acceptedAt),
          isNull(userInvites.revokedAt)
        )
      )
      .returning();

    return invitation ?? null;
  }

  async findUserByEmail(email: string) {
    const [record] = await db.select().from(user).where(eq(user.email, email));
    return record ?? null;
  }

  async acceptInvitation(input: {
    invitationId: number;
    roleId: number;
    email: string;
    name: string;
    passwordHash: string;
  }) {
    return db.transaction(async (tx) => {
      const [existingUser] = await tx
        .select()
        .from(user)
        .where(eq(user.email, input.email));

      const invitedUser =
        existingUser ??
        (
          await tx
            .insert(user)
            .values({
              id: randomUUID(),
              email: input.email,
              name: input.name,
              emailVerified: true,
            })
            .returning()
        )[0];

      if (!invitedUser) {
        return null;
      }

      if (existingUser) {
        await tx
          .update(user)
          .set({
            name: input.name,
            emailVerified: true,
            updatedAt: new Date(),
          })
          .where(eq(user.id, existingUser.id));
      }

      const [credentialAccount] = await tx
        .select()
        .from(account)
        .where(
          and(
            eq(account.userId, invitedUser.id),
            eq(account.providerId, "credential")
          )
        );

      if (credentialAccount) {
        await tx
          .update(account)
          .set({
            password: input.passwordHash,
            updatedAt: new Date(),
          })
          .where(eq(account.id, credentialAccount.id));
      } else {
        await tx.insert(account).values({
          id: randomUUID(),
          accountId: invitedUser.id,
          providerId: "credential",
          userId: invitedUser.id,
          password: input.passwordHash,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      await tx.delete(userRoles).where(eq(userRoles.userId, invitedUser.id));
      await tx
        .insert(userRoles)
        .values({
          userId: invitedUser.id,
          roleId: input.roleId,
        })
        .onConflictDoNothing();

      const [invitation] = await tx
        .update(userInvites)
        .set({
          acceptedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(userInvites.id, input.invitationId),
            isNull(userInvites.acceptedAt),
            isNull(userInvites.revokedAt)
          )
        )
        .returning();

      return invitation ? invitedUser : null;
    });
  }

  private buildListWhere(input: { q?: string; status?: InvitationStatus }) {
    const conditions = [];
    const q = input.q?.trim();

    if (q) {
      conditions.push(
        or(
          ilike(userInvites.email, `%${q}%`),
          ilike(roles.name, `%${q}%`),
          ilike(user.name, `%${q}%`),
          ilike(user.email, `%${q}%`)
        )
      );
    }

    if (input.status) {
      conditions.push(this.statusWhere(input.status));
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  private statusWhere(status: InvitationStatus) {
    const now = new Date();

    if (status === "accepted") {
      return isNotNull(userInvites.acceptedAt);
    }

    if (status === "revoked") {
      return isNotNull(userInvites.revokedAt);
    }

    if (status === "expired") {
      return and(
        isNull(userInvites.acceptedAt),
        isNull(userInvites.revokedAt),
        lte(userInvites.expiresAt, now)
      );
    }

    return and(
      isNull(userInvites.acceptedAt),
      isNull(userInvites.revokedAt),
      gt(userInvites.expiresAt, now)
    );
  }
}
