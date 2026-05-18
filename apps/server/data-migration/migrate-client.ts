// scripts/migrate-clients.ts
import {config} from "dotenv";

config({
  path : "./.env"
});

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";

import { user } from "../src/db/schema/auth.schema";
import { clients } from "../src/db/schema";

const oldPool = new Pool({
  connectionString: process.env.OLD_DATABASE_URL,
});

const newPool = new Pool({
  connectionString: process.env.NEW_DATABASE_URL,
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
      .select({ id: user.id })
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

    const [insertedClient] = await newDb
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
      .returning();

    console.log(`Migrated client: ${insertedClient.name}`);
    migrated++;
  }

  console.log({
    total: oldClients.length,
    migrated,
    skipped,
  });
}

migrateClients()
  .catch((error) => {
    console.error("Client migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await oldPool.end();
    await newPool.end();
  });