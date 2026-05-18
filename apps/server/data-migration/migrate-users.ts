// scripts/migrate-users.ts
import { env } from "../src/config/env";

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { hashPassword } from "better-auth/crypto";

import { user, account, roles, userRoles } from "../src/db/schema";

const DEFAULT_PASSWORD = "Password@123";

const oldPool = new Pool({
  connectionString: env.OLD_DB_CONNECTION_STRING,
});

const newPool = new Pool({
  connectionString: env.NEW_DB_CONNECTION_STRING,
});

const newDb = drizzle(newPool);

function mapRole(oldRole?: string | null) {
  const role = oldRole?.toLowerCase().trim();

  switch (role) {
    case "system-admin":
      return "system-admin";

    case "project manager":
      return "manager";

    case "developer":
      return "developer";

    case "team lead":
      return "teamlead";

    default:
      return "guest";
  }
}

async function migrateUsers() {
  const newRoles = await newDb.select().from(roles);

  const newRoleMap = new Map(
    newRoles.map((role) => [role.name.toLowerCase().trim(), role])
  );

  const { rows: oldUsers } = await oldPool.query(`
    SELECT
      u.id,
      u.first_name,
      u.last_name,
      u.email,
      u.profile_pic,
      u.is_active,
      u.tfa_enabled,
      u.created_at,
      u.updated_at,
      r.name AS role_name
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE u.deleted_at IS NULL
    ORDER BY u.created_at ASC
  `);

  const hashedPassword = await hashPassword(DEFAULT_PASSWORD);

  let migrated = 0;
  let skipped = 0;

  for (const oldUser of oldUsers) {
    const userId = oldUser.id?.toString();

    if (!userId || !oldUser.email) {
      skipped++;
      continue;
    }

    const name =
      `${oldUser.first_name ?? ""} ${oldUser.last_name ?? ""}`.trim() ||
      oldUser.email;

    await newDb
      .insert(user)
      .values({
        id: userId,
        name,
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

    const mappedRoleName = mapRole(oldUser.role_name);
    const mappedRole = newRoleMap.get(mappedRoleName);

    if (!mappedRole) {
      skipped++;
      console.warn(
        `Role "${mappedRoleName}" not found in new DB for ${oldUser.email}`
      );
      continue;
    }

    await newDb
      .insert(userRoles)
      .values({
        userId,
        roleId: mappedRole.id,
      })
      .onConflictDoNothing();

    migrated++;

    console.log(
      `Migrated user: ${oldUser.email} | old role: ${
        oldUser.role_name ?? "none"
      } | new role: ${mappedRole.name}`
    );
  }

  console.log({
    total: oldUsers.length,
    migrated,
    skipped,
    defaultPassword: DEFAULT_PASSWORD,
  });
}

console.log("Starting user migration...");

migrateUsers()
  .catch((error) => {
    console.error("User migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await oldPool.end();
    await newPool.end();
  });
