import { randomUUID } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { account, roles, user, userInvites } from "@/lib/db/schema";

export type InviteRecord = typeof userInvites.$inferSelect;

export class InvitesRepository {
  async createInvite(input: {
    email: string;
    roleId: number;
    tokenHash: string;
    invitedBy: string;
    expiresAt: Date;
  }) {
    const [invite] = await db.insert(userInvites).values(input).returning();

    if (!invite) {
      throw new Error("Failed to create invite");
    }

    return invite;
  }

  async findInviteByTokenHash(tokenHash: string) {
    const [invite] = await db
      .select({
        id: userInvites.id,
        email: userInvites.email,
        roleId: userInvites.roleId,
        tokenHash: userInvites.tokenHash,
        invitedBy: userInvites.invitedBy,
        expiresAt: userInvites.expiresAt,
        acceptedAt: userInvites.acceptedAt,
        createdAt: userInvites.createdAt,
        updatedAt: userInvites.updatedAt,
        roleName: roles.name,
        roleDescription: roles.description,
      })
      .from(userInvites)
      .innerJoin(roles, eq(userInvites.roleId, roles.id))
      .where(eq(userInvites.tokenHash, tokenHash));

    return invite ?? null;
  }

  async markInviteAccepted(inviteId: number) {
    await db
      .update(userInvites)
      .set({
        acceptedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(userInvites.id, inviteId), isNull(userInvites.acceptedAt)));
  }

  async findUserByEmail(email: string) {
    const [record] = await db.select().from(user).where(eq(user.email, email));
    return record ?? null;
  }

  async createVerifiedUser(input: { id: string; email: string; name: string }) {
    const [createdUser] = await db
      .insert(user)
      .values({
        id: input.id,
        email: input.email,
        name: input.name,
        emailVerified: true,
      })
      .returning();

    if (!createdUser) {
      throw new Error("Failed to create invited user");
    }

    return createdUser;
  }

  async markUserEmailVerified(userId: string, name?: string) {
    const [updatedUser] = await db
      .update(user)
      .set({
        ...(name ? { name } : {}),
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning();

    return updatedUser ?? null;
  }

  async findCredentialAccount(userId: string) {
    const [record] = await db
      .select()
      .from(account)
      .where(
        and(eq(account.userId, userId), eq(account.providerId, "credential"))
      );

    return record ?? null;
  }

  async upsertCredentialAccount(input: {
    userId: string;
    passwordHash: string;
  }) {
    const credentialAccount = await this.findCredentialAccount(input.userId);

    if (!credentialAccount) {
      await db.insert(account).values({
        id: randomUUID(),
        accountId: input.userId,
        providerId: "credential",
        userId: input.userId,
        password: input.passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return;
    }

    await db
      .update(account)
      .set({
        password: input.passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(account.id, credentialAccount.id));
  }
}
