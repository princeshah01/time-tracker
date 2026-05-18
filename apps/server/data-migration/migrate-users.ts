// scripts/migrate-users.ts
import {config} from "dotenv";

config({
  path : "./.env"
});

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { hashPassword } from "better-auth/crypto";

import { user, account } from "../src/db/schema";

const DEFAULT_PASSWORD = "Password@123";

const oldPool = new Pool({
  connectionString: process.env.OLD_DATABASE_URL,
});

const newPool = new Pool({
  connectionString: process.env.NEW_DATABASE_URL,
});

const newDb = drizzle(newPool);

async function migrateUsers() {
  const { rows: oldUsers } = await oldPool.query(`
    SELECT
      id,
      first_name,
      last_name,
      email,
      profile_pic,
      is_active,
      tfa_enabled,
      created_at,
      updated_at
    FROM users
    WHERE deleted_at IS NULL
  `);

  const hashedPassword = await hashPassword(DEFAULT_PASSWORD);

  for (const oldUser of oldUsers) {
    const userId = oldUser.id.toString();

    const name = `${oldUser.first_name ?? ""} ${oldUser.last_name ?? ""}`.trim();

    await newDb
      .insert(user)
      .values({
        id: userId,
        name: name,
        email: oldUser.email,
        emailVerified: true,
        image: null,
        isActive: oldUser.is_active ?? true,
        twoFactorEnabled: false,
        createdAt: oldUser.created_at,
        updatedAt: oldUser.updated_at,
      })
      .onConflictDoNothing();

    await newDb
      .insert(account)
      .values({
        id: crypto.randomUUID(),
        accountId: oldUser.email,
        providerId: "credential",
        userId,
        password: hashedPassword,
        createdAt: oldUser.created_at,
        updatedAt: oldUser.updated_at,
      })
      .onConflictDoNothing();

    console.log(`Migrated user: ${oldUser.email}`);
  }

  console.log(`Done. Users migrated: ${oldUsers.length}`);
}

migrateUsers()
  .catch((error) => {
    console.error("User migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await oldPool.end();
    await newPool.end();
  });