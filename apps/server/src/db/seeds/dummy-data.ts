import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { and, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  account,
  clients,
  projects,
  roles,
  user,
  userRoles,
} from "@/db/schema";
import { type RoleName, roleNames } from "@/shared/constants/role-permission";
import { seedRolePermissions } from "./role-permissions";

const DUMMY_PASSWORD = "Password@123";

type SeedUser = {
  id: string;
  name: string;
  email: string;
  role: RoleName;
};

type SeedClient = {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
};

type SeedProject = {
  name: string;
  clientIndex: number;
  priority: "low" | "medium" | "high" | "urgent";
  billingType: "fixed_bill" | "hours_worked";
  totalProjectIncome?: string | null;
  startOffsetDays: number;
  durationDays: number;
};

const seedUsers: SeedUser[] = [
  {
    id: "seed-user-project-manager-01",
    name: "Aarav Mehta",
    email: "aarav.manager@example.com",
    role: roleNames.manager,
  },
  {
    id: "seed-user-project-manager-02",
    name: "Isha Shah",
    email: "isha.manager@example.com",
    role: roleNames.manager,
  },
  {
    id: "seed-user-project-manager-03",
    name: "Rohan Patel",
    email: "rohan.manager@example.com",
    role: roleNames.manager,
  },
  {
    id: "seed-user-project-manager-04",
    name: "Meera Singh",
    email: "meera.manager@example.com",
    role: roleNames.manager,
  },
  {
    id: "seed-user-team-lead-01",
    name: "Kabir Rao",
    email: "kabir.lead@example.com",
    role: roleNames.teamLead,
  },
  {
    id: "seed-user-team-lead-02",
    name: "Naina Kapoor",
    email: "naina.lead@example.com",
    role: roleNames.teamLead,
  },
  {
    id: "seed-user-team-lead-03",
    name: "Vihaan Desai",
    email: "vihaan.lead@example.com",
    role: roleNames.teamLead,
  },
  {
    id: "seed-user-team-lead-04",
    name: "Sara Thomas",
    email: "sara.lead@example.com",
    role: roleNames.teamLead,
  },
  {
    id: "seed-user-team-lead-05",
    name: "Devansh Nair",
    email: "devansh.lead@example.com",
    role: roleNames.teamLead,
  },
  {
    id: "seed-user-developer-01",
    name: "Anaya Joshi",
    email: "anaya.dev@example.com",
    role: roleNames.developer,
  },
  {
    id: "seed-user-developer-02",
    name: "Arjun Gupta",
    email: "arjun.dev@example.com",
    role: roleNames.developer,
  },
  {
    id: "seed-user-developer-03",
    name: "Diya Iyer",
    email: "diya.dev@example.com",
    role: roleNames.developer,
  },
  {
    id: "seed-user-developer-04",
    name: "Kian Bhat",
    email: "kian.dev@example.com",
    role: roleNames.developer,
  },
  {
    id: "seed-user-developer-05",
    name: "Maya Reddy",
    email: "maya.dev@example.com",
    role: roleNames.developer,
  },
  {
    id: "seed-user-developer-06",
    name: "Neil Fernandes",
    email: "neil.dev@example.com",
    role: roleNames.developer,
  },
  {
    id: "seed-user-developer-07",
    name: "Priya Menon",
    email: "priya.dev@example.com",
    role: roleNames.developer,
  },
  {
    id: "seed-user-developer-08",
    name: "Reyansh Kulkarni",
    email: "reyansh.dev@example.com",
    role: roleNames.developer,
  },
  {
    id: "seed-user-developer-09",
    name: "Tara Malhotra",
    email: "tara.dev@example.com",
    role: roleNames.developer,
  },
  {
    id: "seed-user-developer-10",
    name: "Yash Verma",
    email: "yash.dev@example.com",
    role: roleNames.developer,
  },
  {
    id: "seed-user-developer-11",
    name: "Zara Khan",
    email: "zara.dev@example.com",
    role: roleNames.developer,
  },
];

const seedClients: SeedClient[] = [
  {
    name: "Acme Operations",
    company: "Acme Inc",
    email: "ops@acme.example.com",
    phone: "+1 555 0101",
    address: "120 Market Street, San Francisco, CA",
  },
  {
    name: "Northstar Finance",
    company: "Northstar Group",
    email: "finance@northstar.example.com",
    phone: "+1 555 0102",
    address: "88 Lake View Road, Chicago, IL",
  },
  {
    name: "BluePeak Retail",
    company: "BluePeak Stores",
    email: "projects@bluepeak.example.com",
    phone: "+1 555 0103",
    address: "45 Commerce Avenue, Austin, TX",
  },
  {
    name: "Vertex Health",
    company: "Vertex Health Systems",
    email: "delivery@vertexhealth.example.com",
    phone: "+1 555 0104",
    address: "72 Wellness Drive, Boston, MA",
  },
  {
    name: "Summit Logistics",
    company: "Summit Logistics LLC",
    email: "it@summitlogistics.example.com",
    phone: "+1 555 0105",
    address: "310 Harbor Way, Seattle, WA",
  },
];

const seedProjects: SeedProject[] = [
  {
    name: "Operations Portal Refresh",
    clientIndex: 0,
    priority: "high",
    billingType: "fixed_bill",
    totalProjectIncome: "45000.00",
    startOffsetDays: -20,
    durationDays: 90,
  },
  {
    name: "Invoice Automation",
    clientIndex: 1,
    priority: "urgent",
    billingType: "hours_worked",
    startOffsetDays: -12,
    durationDays: 75,
  },
  {
    name: "Retail Analytics Dashboard",
    clientIndex: 2,
    priority: "medium",
    billingType: "fixed_bill",
    totalProjectIncome: "38000.00",
    startOffsetDays: -8,
    durationDays: 60,
  },
  {
    name: "Patient Intake Workflow",
    clientIndex: 3,
    priority: "high",
    billingType: "hours_worked",
    startOffsetDays: -5,
    durationDays: 80,
  },
  {
    name: "Fleet Scheduling System",
    clientIndex: 4,
    priority: "medium",
    billingType: "fixed_bill",
    totalProjectIncome: "52000.00",
    startOffsetDays: 0,
    durationDays: 100,
  },
  {
    name: "Client Reporting API",
    clientIndex: 0,
    priority: "medium",
    billingType: "hours_worked",
    startOffsetDays: 4,
    durationDays: 55,
  },
  {
    name: "Payments Reconciliation",
    clientIndex: 1,
    priority: "high",
    billingType: "fixed_bill",
    totalProjectIncome: "64000.00",
    startOffsetDays: 7,
    durationDays: 95,
  },
  {
    name: "Storefront Performance Pass",
    clientIndex: 2,
    priority: "low",
    billingType: "hours_worked",
    startOffsetDays: 10,
    durationDays: 45,
  },
  {
    name: "Care Coordination MVP",
    clientIndex: 3,
    priority: "urgent",
    billingType: "fixed_bill",
    totalProjectIncome: "72000.00",
    startOffsetDays: 14,
    durationDays: 120,
  },
  {
    name: "Warehouse Mobile App",
    clientIndex: 4,
    priority: "medium",
    billingType: "hours_worked",
    startOffsetDays: 18,
    durationDays: 70,
  },
];

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

async function seedCredentialAccount(input: {
  userId: string;
  passwordHash: string;
}) {
  const [credentialAccount] = await db
    .select({ id: account.id })
    .from(account)
    .where(
      and(
        eq(account.userId, input.userId),
        eq(account.providerId, "credential")
      )
    )
    .limit(1);

  if (credentialAccount) {
    await db
      .update(account)
      .set({
        accountId: input.userId,
        password: input.passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(account.id, credentialAccount.id));
    return;
  }

  await db.insert(account).values({
    id: randomUUID(),
    accountId: input.userId,
    providerId: "credential",
    userId: input.userId,
    password: input.passwordHash,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

async function seedDummyUsers() {
  const roleRecords = await db
    .select({ id: roles.id, name: roles.name })
    .from(roles)
    .where(
      inArray(roles.name, [
        roleNames.manager,
        roleNames.teamLead,
        roleNames.developer,
      ])
    );

  const roleIdByName = new Map(
    roleRecords.map((role) => [role.name as RoleName, role.id])
  );
  const passwordHash = await hashPassword(DUMMY_PASSWORD);
  const userIdsByEmail = new Map<string, string>();

  for (const seedUser of seedUsers) {
    const roleId = roleIdByName.get(seedUser.role);

    if (!roleId) {
      throw new Error(`Role '${seedUser.role}' was not found.`);
    }

    const [savedUser] = await db
      .insert(user)
      .values({
        id: seedUser.id,
        name: seedUser.name,
        email: seedUser.email,
        emailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: user.email,
        set: {
          name: sql`excluded.name`,
          emailVerified: true,
          isActive: true,
          updatedAt: new Date(),
        },
      })
      .returning({ id: user.id, email: user.email });

    if (!savedUser) {
      throw new Error(`Failed to seed user '${seedUser.email}'.`);
    }

    userIdsByEmail.set(savedUser.email, savedUser.id);

    await seedCredentialAccount({
      userId: savedUser.id,
      passwordHash,
    });

    await db.delete(userRoles).where(eq(userRoles.userId, savedUser.id));
    await db
      .insert(userRoles)
      .values({ userId: savedUser.id, roleId })
      .onConflictDoNothing();
  }

  return userIdsByEmail;
}

async function upsertClient(input: SeedClient & { createdBy: string }) {
  const [existingClient] = await db
    .select({ id: clients.id })
    .from(clients)
    .where(eq(clients.email, input.email))
    .limit(1);

  if (existingClient) {
    const [updatedClient] = await db
      .update(clients)
      .set({
        name: input.name,
        company: input.company,
        phone: input.phone,
        address: input.address,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, existingClient.id))
      .returning({ id: clients.id });

    return updatedClient?.id ?? existingClient.id;
  }

  const [createdClient] = await db
    .insert(clients)
    .values({
      name: input.name,
      company: input.company,
      email: input.email,
      phone: input.phone,
      address: input.address,
      isActive: true,
      createdBy: input.createdBy,
    })
    .returning({ id: clients.id });

  if (!createdClient) {
    throw new Error(`Failed to seed client '${input.email}'.`);
  }

  return createdClient.id;
}

async function upsertProject(
  input: SeedProject & { clientId: number; createdBy: string }
) {
  const today = new Date();
  const startDate = addDays(today, input.startOffsetDays);
  const expectedEndDate = addDays(startDate, input.durationDays);
  const [existingProject] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.name, input.name))
    .limit(1);

  const projectValues = {
    name: input.name,
    clientId: input.clientId,
    priority: input.priority,
    description: `${input.name} seeded for local testing.`,
    isActive: true,
    startDate,
    expectedEndDate,
    billingType: input.billingType,
    totalProjectIncome:
      input.billingType === "fixed_bill"
        ? (input.totalProjectIncome ?? null)
        : null,
    updatedAt: new Date(),
  };

  if (existingProject) {
    await db
      .update(projects)
      .set(projectValues)
      .where(eq(projects.id, existingProject.id));
    return;
  }

  await db.insert(projects).values({
    ...projectValues,
    createdBy: input.createdBy,
    createdAt: new Date(),
  });
}

async function seedDummyData() {
  await seedRolePermissions();

  const userIdsByEmail = await seedDummyUsers();
  const createdBy = userIdsByEmail.get(seedUsers[0]?.email ?? "");

  if (!createdBy) {
    throw new Error("Seed project manager was not found.");
  }

  const clientIds = [];

  for (const seedClient of seedClients) {
    const clientId = await upsertClient({ ...seedClient, createdBy });
    clientIds.push(clientId);
  }

  for (const seedProject of seedProjects) {
    const clientId = clientIds[seedProject.clientIndex];

    if (!clientId) {
      throw new Error(
        `Client index '${seedProject.clientIndex}' was not found.`
      );
    }

    await upsertProject({
      ...seedProject,
      clientId,
      createdBy,
    });
  }
}

seedDummyData()
  .then(() => {
    // biome-ignore lint/suspicious/noConsole: Seed scripts report CLI status.
    console.log("Dummy data seed completed.");
    // biome-ignore lint/suspicious/noConsole: Seed scripts report CLI status.
    console.log(`Seeded users can sign in with password: ${DUMMY_PASSWORD}`);
    process.exit(0);
  })
  .catch((error) => {
    // biome-ignore lint/suspicious/noConsole: Seed scripts report CLI status.
    console.error("Dummy data seed failed.");
    // biome-ignore lint/suspicious/noConsole: Seed scripts report CLI errors.
    console.error(error);
    process.exit(1);
  });
