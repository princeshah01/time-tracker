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
