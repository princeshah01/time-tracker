import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { user } from "./auth.schema";

export const projectPriority = pgEnum("project_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const projectBillingType = pgEnum("project_billing_type", [
  "fixed_bill",
  "hours_worked",
]);

export const projectTeamRole = pgEnum("project_team_role", [
  "manager",
  "lead",
  "member",
]);

export const taskStatus = pgEnum("task_status", [
  "todo",
  "inprogress",
  "completed",
]);

export const clients = pgTable(
  "clients",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    company: text("company"),
    email: text("email").notNull(),
    phone: text("phone"),
    address: text("address"),
    isActive: boolean("is_active").default(true).notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("clients_created_by_idx").on(table.createdBy),
    index("clients_email_idx").on(table.email),
    index("clients_is_active_idx").on(table.isActive),
  ]
);

export const projects = pgTable(
  "projects",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    priority: projectPriority("priority").default("medium").notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    startDate: timestamp("start_date").notNull(),
    expectedEndDate: timestamp("expected_end_date"),
    billingType: projectBillingType("billing_type").notNull(),
    totalProjectIncome: numeric("total_project_income", {
      precision: 12,
      scale: 2,
    }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("projects_client_id_idx").on(table.clientId),
    index("projects_created_by_idx").on(table.createdBy),
    index("projects_is_active_idx").on(table.isActive),
    index("projects_billing_type_idx").on(table.billingType),
  ]
);

export const projectTeamMembers = pgTable(
  "project_team_members",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    role: projectTeamRole("role").notNull(),
    hourlyRate: numeric("hourly_rate", { precision: 12, scale: 2 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    unique("project_team_members_project_id_user_id_unique").on(
      table.projectId,
      table.userId
    ),
    index("project_team_members_project_id_idx").on(table.projectId),
    index("project_team_members_user_id_idx").on(table.userId),
    index("project_team_members_role_idx").on(table.role),
  ]
);

export const tasks = pgTable(
  "tasks",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    status: taskStatus("status").default("todo").notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("tasks_project_id_idx").on(table.projectId),
    index("tasks_created_by_idx").on(table.createdBy),
    index("tasks_status_idx").on(table.status),
  ]
);

export const timesheets = pgTable(
  "timesheets",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    timesheetName: text("timesheet_name").notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("timesheets_project_id_idx").on(table.projectId),
    index("timesheets_created_by_idx").on(table.createdBy),
    index("timesheets_range_idx").on(table.startDate, table.endDate),
  ]
);

export const timesheetUsers = pgTable(
  "timesheet_users",
  {
    id: serial("id").primaryKey(),
    timesheetId: integer("timesheet_id")
      .notNull()
      .references(() => timesheets.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("timesheet_users_timesheet_id_user_id_unique").on(
      table.timesheetId,
      table.userId
    ),
    index("timesheet_users_timesheet_id_idx").on(table.timesheetId),
    index("timesheet_users_user_id_idx").on(table.userId),
  ]
);

export const timesheetEntries = pgTable(
  "timesheet_entries",
  {
    id: serial("id").primaryKey(),
    timesheetId: integer("timesheet_id")
      .notNull()
      .references(() => timesheets.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    entryDate: timestamp("entry_date").notNull(),
    taskId: integer("task_id").references(() => tasks.id, {
      onDelete: "set null",
    }),
    minutesSpent: integer("minutes_spent").default(0).notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    unique("timesheet_entries_timesheet_user_date_unique").on(
      table.timesheetId,
      table.userId,
      table.entryDate
    ),
    index("timesheet_entries_timesheet_id_idx").on(table.timesheetId),
    index("timesheet_entries_user_id_idx").on(table.userId),
    index("timesheet_entries_entry_date_idx").on(table.entryDate),
    index("timesheet_entries_task_id_idx").on(table.taskId),
  ]
);

export const clientsRelations = relations(clients, ({ one, many }) => ({
  createdByUser: one(user, {
    fields: [clients.createdBy],
    references: [user.id],
  }),
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  createdByUser: one(user, {
    fields: [projects.createdBy],
    references: [user.id],
  }),
  teamMembers: many(projectTeamMembers),
  tasks: many(tasks),
  timesheets: many(timesheets),
}));

export const projectTeamMembersRelations = relations(
  projectTeamMembers,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectTeamMembers.projectId],
      references: [projects.id],
    }),
    user: one(user, {
      fields: [projectTeamMembers.userId],
      references: [user.id],
    }),
  })
);

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  creator: one(user, {
    fields: [tasks.createdBy],
    references: [user.id],
  }),
}));

export const timesheetsRelations = relations(timesheets, ({ one, many }) => ({
  project: one(projects, {
    fields: [timesheets.projectId],
    references: [projects.id],
  }),
  creator: one(user, {
    fields: [timesheets.createdBy],
    references: [user.id],
  }),
  users: many(timesheetUsers),
  entries: many(timesheetEntries),
}));

export const timesheetUsersRelations = relations(timesheetUsers, ({ one }) => ({
  timesheet: one(timesheets, {
    fields: [timesheetUsers.timesheetId],
    references: [timesheets.id],
  }),
  user: one(user, {
    fields: [timesheetUsers.userId],
    references: [user.id],
  }),
}));

export const timesheetEntriesRelations = relations(
  timesheetEntries,
  ({ one }) => ({
    timesheet: one(timesheets, {
      fields: [timesheetEntries.timesheetId],
      references: [timesheets.id],
    }),
    user: one(user, {
      fields: [timesheetEntries.userId],
      references: [user.id],
    }),
    task: one(tasks, {
      fields: [timesheetEntries.taskId],
      references: [tasks.id],
    }),
    creator: one(user, {
      fields: [timesheetEntries.createdBy],
      references: [user.id],
    }),
  })
);
