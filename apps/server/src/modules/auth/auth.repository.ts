import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema";

export type UserRecord = typeof user.$inferSelect;

export class AuthRepository {
  async findUserStatusByEmail(
    email: string
  ): Promise<Pick<UserRecord, "id" | "email" | "isActive"> | null> {
    const [record] = await db
      .select({
        id: user.id,
        email: user.email,
        isActive: user.isActive,
      })
      .from(user)
      .where(eq(user.email, email.trim().toLowerCase()))
      .limit(1);

    return record ?? null;
  }
  async findUserStatusById(
    userId: string
  ): Promise<Pick<UserRecord, "id" | "email" | "isActive"> | null> {
    const [record] = await db
      .select({
        id: user.id,
        email: user.email,
        isActive: user.isActive,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    return record ?? null;
  }
}
