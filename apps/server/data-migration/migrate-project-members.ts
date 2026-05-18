// scripts/migrate-project-members.ts

import { env } from "../src/config/env";

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq } from "drizzle-orm";

import { user, projects, projectTeamMembers } from "../src/db/schema";

const oldPool = new Pool({
  connectionString: env.OLD_DB_CONNECTION_STRING,
});

const newPool = new Pool({
  connectionString: env.NEW_DB_CONNECTION_STRING,
});

const newDb = drizzle(newPool);

function mapProjectRole(role?: string | null) {
  const value = role?.toUpperCase().trim();

  if (value === "MANAGER") return "manager";
  if (value === "LEAD") return "lead";

  return "member";
}

async function migrateProjectMembers() {
  const { rows: oldMembers } = await oldPool.query(`
    SELECT
      pm.id,
      pm.project_id,
      pm.user_id,
      pm.role,
      pm.hourly_rate,
      pm.created_at,
      pm.updated_at,
      p.name AS project_name,
      p.created_by AS project_created_by
    FROM project_members pm
    JOIN projects p ON p.id = pm.project_id
    WHERE p.deleted_at IS NULL
    ORDER BY pm.created_at ASC
  `);

  let migrated = 0;
  let skipped = 0;

  for (const oldMember of oldMembers) {
    const userId = oldMember.user_id?.toString();
    const projectCreatedBy = oldMember.project_created_by?.toString();

    if (!userId || !projectCreatedBy) {
      skipped++;
      continue;
    }

    const [existingUser] = await newDb
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!existingUser) {
      skipped++;
      console.warn(`Skipped member, user not found: ${userId}`);
      continue;
    }

    const [existingProject] = await newDb
      .select({ id: projects.id })
      .from(projects)
      .where(
        and(
          eq(projects.name, oldMember.project_name),
          eq(projects.createdBy, projectCreatedBy)
        )
      )
      .limit(1);

    if (!existingProject) {
      skipped++;
      console.warn(
        `Skipped member, project not found: ${oldMember.project_name}`
      );
      continue;
    }

    await newDb
      .insert(projectTeamMembers)
      .values({
        projectId: existingProject.id,
        userId: existingUser.id,
        role: mapProjectRole(oldMember.role),
        hourlyRate: oldMember.hourly_rate,
        createdAt: oldMember.created_at,
        updatedAt: oldMember.updated_at,
      })
      .onConflictDoNothing();

    migrated++;

    console.log(
      `Migrated project member: ${existingUser.id} -> ${oldMember.project_name} as ${mapProjectRole(oldMember.role)}`
    );
  }

  console.log({
    total: oldMembers.length,
    migrated,
    skipped,
  });
}

console.log("Starting project members migration...");

migrateProjectMembers()
  .catch((error) => {
    console.error("Project members migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await oldPool.end();
    await newPool.end();
  });
