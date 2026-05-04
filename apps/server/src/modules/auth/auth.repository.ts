import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema";

export class AuthRepository {
  async isUserExistsByEmail(email: string): Promise<boolean> {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      return false;
    }

    const [record] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, normalizedEmail))
      .limit(1);

    return Boolean(record);
  }
}

export const authRepository = new AuthRepository();
