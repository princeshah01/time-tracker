import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { account, user, userSkills } from "@/db/schema";
import type { UpdateProfileInput } from "./profile.types";

export class ProfileRepository {
  async findUserById(userId: string) {
    const [record] = await db.select().from(user).where(eq(user.id, userId));

    return record ?? null;
  }

  async findUserAccounts(userId: string) {
    return db.select().from(account).where(eq(account.userId, userId));
  }

  async listSkillsByUserId(userId: string) {
    return db
      .select({
        name: userSkills.name,
      })
      .from(userSkills)
      .where(eq(userSkills.userId, userId));
  }

  async updateUserProfile(userId: string, input: UpdateProfileInput) {
    const profileInput = {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.image !== undefined ? { image: input.image } : {}),
    };

    if (Object.keys(profileInput).length === 0) {
      return null;
    }

    const [updatedUser] = await db
      .update(user)
      .set({
        ...profileInput,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning();

    return updatedUser ?? null;
  }

  async replaceUserSkills(userId: string, skills: string[]) {
    await db.transaction(async (tx) => {
      const existingSkills = await tx
        .select({
          name: userSkills.name,
        })
        .from(userSkills)
        .where(eq(userSkills.userId, userId));

      const existingSet = new Set(
        existingSkills.map((s) => s.name.toLowerCase())
      );

      const incomingSet = new Set(skills.map((s) => s.toLowerCase()));

      const toInsert = skills.filter(
        (skill) => !existingSet.has(skill.toLowerCase())
      );

      const toDelete = existingSkills.filter(
        (skill) => !incomingSet.has(skill.name.toLowerCase())
      );

      if (toDelete.length > 0) {
        await tx.delete(userSkills).where(
          and(
            eq(userSkills.userId, userId),
            inArray(
              userSkills.name,
              toDelete.map((s) => s.name)
            )
          )
        );
      }

      if (toInsert.length > 0) {
        await tx
          .insert(userSkills)
          .values(
            toInsert.map((name) => ({
              userId,
              name,
            }))
          )
          .onConflictDoNothing();
      }
    });
  }
}
