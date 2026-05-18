// scripts/migrate-tasks.ts

import { env } from "../src/config/env";

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq } from "drizzle-orm";

import { user, projects, tasks } from "../src/db/schema";

const oldPool = new Pool({
  connectionString: env.OLD_DB_CONNECTION_STRING,
});

const newPool = new Pool({
  connectionString: env.NEW_DB_CONNECTION_STRING,
});

const newDb = drizzle(newPool);

function mapTaskStatus(status?: string | null) {
  const value = status?.toUpperCase().trim();

  if (value === "IN_PROGRESS") return "inprogress";
  if (value === "COMPLETED") return "completed";

  return "todo";
}

async function migrateTasks() {
  const { rows: oldTasks } = await oldPool.query(`
    SELECT
      t.id,
      t.name,
      t.description,
      t.project_id,
      t.assigned_by,
      t.status,
      t.created_at,
      t.updated_at,
      p.name AS project_name,
      p.created_by AS project_created_by
    FROM tasks t
    JOIN projects p ON p.id = t.project_id
    WHERE t.deleted_at IS NULL
      AND p.deleted_at IS NULL
    ORDER BY t.created_at ASC
  `);

  let migrated = 0;
  let skipped = 0;

  for (const oldTask of oldTasks) {
    const createdBy = oldTask.assigned_by?.toString();
    const projectCreatedBy = oldTask.project_created_by?.toString();

    if (!createdBy || !projectCreatedBy) {
      skipped++;
      console.warn(`Skipped task "${oldTask.name}" because created_by missing`);
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
        `Skipped task "${oldTask.name}" because assigned_by user not found: ${createdBy}`
      );
      continue;
    }

    const [existingProject] = await newDb
      .select({ id: projects.id })
      .from(projects)
      .where(
        and(
          eq(projects.name, oldTask.project_name),
          eq(projects.createdBy, projectCreatedBy)
        )
      )
      .limit(1);

    if (!existingProject) {
      skipped++;
      console.warn(
        `Skipped task "${oldTask.name}" because project not found: ${oldTask.project_name}`
      );
      continue;
    }

    await newDb
      .insert(tasks)
      .values({
        projectId: existingProject.id,
        title: oldTask.name,
        description: oldTask.description,
        status: mapTaskStatus(oldTask.status),
        createdBy: existingUser.id,
        createdAt: oldTask.created_at,
        updatedAt: oldTask.updated_at,
      })
      .onConflictDoNothing();

    migrated++;

    console.log(
      `Migrated task: ${oldTask.name} | status: ${oldTask.status} -> ${mapTaskStatus(
        oldTask.status
      )}`
    );
  }

  console.log({
    total: oldTasks.length,
    migrated,
    skipped,
  });
}

console.log("Starting task migration...");

migrateTasks()
  .catch((error) => {
    console.error("Task migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await oldPool.end();
    await newPool.end();
  });
