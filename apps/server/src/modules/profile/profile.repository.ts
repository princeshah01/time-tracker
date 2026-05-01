import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { account, user } from "@/lib/db/schema";

export class ProfileRepository {
  async findUserById(userId: string) {
    const [record] = await db.select().from(user).where(eq(user.id, userId));
    return record ?? null;
  }

  async findUserAccounts(userId: string) {
    return db.select().from(account).where(eq(account.userId, userId));
  }

  async updateUserProfile(
    userId: string,
    input: { name?: string; image?: string | null }
  ) {
    const [updatedUser] = await db
      .update(user)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning();

    return updatedUser ?? null;
  }
}
