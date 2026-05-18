// scripts/migrate-clients.ts

import { env } from "../src/config/env";

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";

import { user } from "../src/db/schema/auth.schema";
import { clients } from "../src/db/schema";

const oldPool = new Pool({
  connectionString: env.OLD_DB_CONNECTION_STRING,
});

const newPool = new Pool({
  connectionString: env.NEW_DB_CONNECTION_STRING,
});

const newDb = drizzle(newPool);

async function migrateClients() {
  const { rows: oldClients } = await oldPool.query(`
    SELECT
      id,
      name,
      email,
      company_name,
      phone,
      address,
      status,
      created_by,
      created_at,
      updated_at
    FROM clients
    WHERE deleted_at IS NULL
    ORDER BY created_at ASC
  `);

  let migrated = 0;
  let skipped = 0;

  for (const oldClient of oldClients) {
    const createdBy = oldClient.created_by?.toString();

    if (!createdBy) {
      skipped++;

      console.warn(`Skipped client without created_by: ${oldClient.email}`);

      continue;
    }

    const [existingUser] = await newDb
      .select({
        id: user.id,
      })
      .from(user)
      .where(eq(user.id, createdBy))
      .limit(1);

    if (!existingUser) {
      skipped++;

      console.warn(
        `Skipped client "${oldClient.name}" because created_by user not found in new DB: ${createdBy}`
      );

      continue;
    }

    await newDb
      .insert(clients)
      .values({
        name: oldClient.name,
        company: oldClient.company_name,
        email: oldClient.email,
        phone: oldClient.phone,
        address: oldClient.address,
        isActive: oldClient.status ?? true,
        createdBy: existingUser.id,
        createdAt: oldClient.created_at,
        updatedAt: oldClient.updated_at,
      })
      .onConflictDoNothing();

    migrated++;

    console.log(
      `Migrated client: ${oldClient.name} | created by: ${existingUser.id}`
    );
  }

  console.log({
    total: oldClients.length,
    migrated,
    skipped,
  });
}

console.log("Starting client migration...");

migrateClients()
  .catch((error) => {
    console.error("Client migration failed:", error);

    process.exit(1);
  })
  .finally(async () => {
    await oldPool.end();
    await newPool.end();
  });
