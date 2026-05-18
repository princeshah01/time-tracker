// data-migration/migrate-timesheets.ts

import { env } from "../src/config/env";

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq } from "drizzle-orm";

import {
  user,
  projects,
  tasks,
  timesheets,
  timesheetUsers,
  timesheetEntries,
} from "../src/db/schema";

const oldPool = new Pool({
  connectionString: env.OLD_DB_CONNECTION_STRING,
});

const newPool = new Pool({
  connectionString: env.NEW_DB_CONNECTION_STRING,
});

const newDb = drizzle(newPool);

const TIMESHEET_NAME = "Default Timesheet";
const START_DATE = new Date("2026-04-01T00:00:00.000Z");
const END_DATE = new Date("2026-05-31T23:59:59.999Z");

async function findNewProjectId(oldProject: {
  name: string;
  created_by: string;
}) {
  const [newProject] = await newDb
    .select({
      id: projects.id,
    })
    .from(projects)
    .where(
      and(
        eq(projects.name, oldProject.name),
        eq(projects.createdBy, oldProject.created_by.toString())
      )
    )
    .limit(1);

  return newProject?.id ?? null;
}

async function ensureTimesheetForProject(params: {
  newProjectId: number;
  createdBy: string;
  projectName: string;
}) {
  const timesheetName = `${params.projectName} - ${TIMESHEET_NAME}`;

  const [existingTimesheet] = await newDb
    .select({
      id: timesheets.id,
    })
    .from(timesheets)
    .where(
      and(
        eq(timesheets.projectId, params.newProjectId),
        eq(timesheets.timesheetName, timesheetName)
      )
    )
    .limit(1);

  if (existingTimesheet) {
    return existingTimesheet.id;
  }

  const [createdTimesheet] = await newDb
    .insert(timesheets)
    .values({
      projectId: params.newProjectId,
      timesheetName,
      startDate: START_DATE,
      endDate: END_DATE,
      createdBy: params.createdBy,
    })
    .returning({
      id: timesheets.id,
    });

  return createdTimesheet.id;
}

async function addProjectMembersToTimesheet(params: {
  oldProjectId: string;
  timesheetId: number;
}) {
  const { rows: oldMembers } = await oldPool.query(
    `
    SELECT DISTINCT user_id, created_at
    FROM project_members
    WHERE project_id = $1
    ORDER BY created_at ASC
    `,
    [params.oldProjectId]
  );

  let added = 0;
  let skipped = 0;

  for (const member of oldMembers) {
    const userId = member.user_id?.toString();

    if (!userId) {
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
      console.warn(`Timesheet user skipped. User not found: ${userId}`);
      continue;
    }

    await newDb
      .insert(timesheetUsers)
      .values({
        timesheetId: params.timesheetId,
        userId,
        createdAt: member.created_at,
      })
      .onConflictDoNothing();

    added++;
  }

  return { added, skipped };
}

async function findNewTaskId(params: {
  oldTaskId: string | null;
  newProjectId: number;
}) {
  if (!params.oldTaskId) {
    return null;
  }

  const { rows } = await oldPool.query(
    `
    SELECT name
    FROM tasks
    WHERE id = $1
      AND deleted_at IS NULL
    LIMIT 1
    `,
    [params.oldTaskId]
  );

  const oldTask = rows[0];

  if (!oldTask) {
    return null;
  }

  const [newTask] = await newDb
    .select({
      id: tasks.id,
    })
    .from(tasks)
    .where(
      and(
        eq(tasks.projectId, params.newProjectId),
        eq(tasks.title, oldTask.name)
      )
    )
    .limit(1);

  return newTask?.id ?? null;
}

async function migrateTimesheets() {
  const { rows: oldProjects } = await oldPool.query(`
    SELECT
      id,
      name,
      created_by
    FROM projects
    WHERE deleted_at IS NULL
    ORDER BY created_at ASC
  `);

  const projectMap = new Map<string, number>();
  const projectTimesheetMap = new Map<string, number>();

  let timesheetsReady = 0;
  let projectMembersAdded = 0;
  let projectMembersSkipped = 0;
  let projectsSkipped = 0;

  for (const oldProject of oldProjects) {
    const oldProjectId = oldProject.id?.toString();
    const createdBy = oldProject.created_by?.toString();

    if (!oldProjectId || !createdBy) {
      projectsSkipped++;
      continue;
    }

    const newProjectId = await findNewProjectId({
      name: oldProject.name,
      created_by: createdBy,
    });

    if (!newProjectId) {
      projectsSkipped++;
      console.warn(`Project not found in new DB: ${oldProject.name}`);
      continue;
    }

    const timesheetId = await ensureTimesheetForProject({
      newProjectId,
      createdBy,
      projectName: oldProject.name,
    });

    const memberResult = await addProjectMembersToTimesheet({
      oldProjectId,
      timesheetId,
    });

    projectMap.set(oldProjectId, newProjectId);
    projectTimesheetMap.set(oldProjectId, timesheetId);

    timesheetsReady++;
    projectMembersAdded += memberResult.added;
    projectMembersSkipped += memberResult.skipped;

    console.log(
      `Timesheet ready: ${oldProject.name} | newProjectId: ${newProjectId} | timesheetId: ${timesheetId}`
    );
  }

  const { rows: oldTimeLogs } = await oldPool.query(`
  SELECT
    id,
    user_id,
    task_id,
    project_id,
    date::text AS entry_date,
    time_spent_minutes,
    created_at,
    updated_at
  FROM time_logs
  ORDER BY date ASC
`);

  let entriesMigrated = 0;
  let entriesSkipped = 0;
  let taskMissed = 0;

  for (const oldLog of oldTimeLogs) {
    const oldProjectId = oldLog.project_id?.toString();
    const userId = oldLog.user_id?.toString();
    const oldTaskId = oldLog.task_id?.toString() ?? null;

    if (!oldProjectId || !userId) {
      entriesSkipped++;
      continue;
    }

    const newProjectId = projectMap.get(oldProjectId);
    const timesheetId = projectTimesheetMap.get(oldProjectId);

    if (!newProjectId || !timesheetId) {
      entriesSkipped++;
      console.warn(`Skipped log, project/timesheet not found: ${oldLog.id}`);
      continue;
    }

    const [existingUser] = await newDb
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!existingUser) {
      entriesSkipped++;
      console.warn(`Skipped log, user not found: ${userId}`);
      continue;
    }

    const newTaskId = await findNewTaskId({
      oldTaskId,
      newProjectId,
    });

    if (!newTaskId) {
      taskMissed++;
      console.warn(`Task not found for old task id: ${oldTaskId}`);
    }

    await newDb
      .insert(timesheetUsers)
      .values({
        timesheetId,
        userId,
        createdAt: oldLog.created_at,
      })
      .onConflictDoNothing();

    await newDb.insert(timesheetEntries).values({
      timesheetId,
      userId,
      entryDate: new Date(`${oldLog.entry_date}T00:00:00`),
      taskId: newTaskId,
      minutesSpent: oldLog.time_spent_minutes ?? 0,
      createdBy: userId,
      createdAt: oldLog.created_at,
      updatedAt: oldLog.updated_at,
    });

    entriesMigrated++;

    console.log(
      `Migrated time log: ${oldLog.id} | timesheetId: ${timesheetId} | taskId: ${
        newTaskId ?? "null"
      } | minutes: ${oldLog.time_spent_minutes ?? 0}`
    );
  }

  console.log({
    projects: oldProjects.length,
    timesheetsReady,
    projectsSkipped,
    projectMembersAdded,
    projectMembersSkipped,
    timeLogs: oldTimeLogs.length,
    entriesMigrated,
    entriesSkipped,
    taskMissed,
  });
}

console.log("Starting timesheet and time logs migration...");

migrateTimesheets()
  .catch((error) => {
    console.error("Timesheet migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await oldPool.end();
    await newPool.end();
  });
