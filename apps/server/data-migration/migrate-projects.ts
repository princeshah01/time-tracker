// scripts/migrate-projects.ts

import { env } from "../src/config/env";

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";

import { user, clients, projects } from "../src/db/schema";

const oldPool = new Pool({
  connectionString: env.OLD_DB_CONNECTION_STRING,
});

const newPool = new Pool({
  connectionString: env.NEW_DB_CONNECTION_STRING,
});

const newDb = drizzle(newPool);

function mapPriority(priority?: string | null) {
  const value = priority?.toLowerCase().trim();

  if (value === "low") return "low";
  if (value === "high") return "high";
  if (value === "urgent") return "urgent";

  return "medium";
}

function mapIsActive(status?: string | null) {
  return status?.toLowerCase().trim() === "active";
}

async function migrateProjects() {
  const { rows: oldProjects } = await oldPool.query(`
    SELECT
      p.id,
      p.name,
      p.description,
      p.client_id,
      p.priority,
      p.status,
      p.start_date,
      p.end_date,
      p.created_by,
      p.created_at,
      p.updated_at,
      c.email AS client_email
    FROM projects p
    LEFT JOIN clients c ON c.id = p.client_id
    WHERE p.deleted_at IS NULL
    ORDER BY p.created_at ASC
  `);

  let migrated = 0;
  let skipped = 0;

  for (const oldProject of oldProjects) {
    const createdBy = oldProject.created_by?.toString();

    if (!createdBy) {
      skipped++;
      console.warn(`Skipped project without created_by: ${oldProject.name}`);
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
        `Skipped project "${oldProject.name}" because created_by user not found: ${createdBy}`
      );
      continue;
    }

    if (!oldProject.client_email) {
      skipped++;
      console.warn(
        `Skipped project "${oldProject.name}" because client missing`
      );
      continue;
    }

    const [existingClient] = await newDb
      .select({ id: clients.id })
      .from(clients)
      .where(eq(clients.email, oldProject.client_email))
      .limit(1);

    if (!existingClient) {
      skipped++;
      console.warn(
        `Skipped project "${oldProject.name}" because client not found in new DB: ${oldProject.client_email}`
      );
      continue;
    }

    await newDb
      .insert(projects)
      .values({
        name: oldProject.name,
        clientId: existingClient.id,
        priority: mapPriority(oldProject.priority),
        description: oldProject.description,
        isActive: mapIsActive(oldProject.status),
        startDate: oldProject.start_date,
        expectedEndDate: oldProject.end_date,
        billingType: "hours_worked",
        totalProjectIncome: null,
        createdBy: existingUser.id,
        createdAt: oldProject.created_at,
        updatedAt: oldProject.updated_at,
      })
      .onConflictDoNothing();

    migrated++;

    console.log(
      `Migrated project: ${oldProject.name} | client: ${oldProject.client_email}`
    );
  }

  console.log({
    total: oldProjects.length,
    migrated,
    skipped,
  });
}

console.log("Starting project migration...");

migrateProjects()
  .catch((error) => {
    console.error("Project migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await oldPool.end();
    await newPool.end();
  });
