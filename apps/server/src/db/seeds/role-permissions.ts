import { inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import { permissions, rolePermissions, roles } from "@/db/schema";
import {
  type PermissionKey,
  permissionKeys,
  type RoleName,
  roleNames,
} from "@/shared/constants/role-permission";

type SeedRole = {
  name: RoleName;
  description: string;
  level: number;
  isDefault?: boolean;
  permissions: readonly PermissionKey[];
};

const allPermissions = Object.values(
  permissionKeys
) as readonly PermissionKey[];

const seedRoles: readonly SeedRole[] = [
  {
    name: roleNames.admin,
    description: "Full application access.",
    level: 100,
    permissions: [
      // Profile permissions
      permissionKeys.profileView,
      permissionKeys.profileSecurityManage,
      permissionKeys.profileUpdate,
      // User management permissions
      permissionKeys.userView,
      permissionKeys.userInvite,
      permissionKeys.userManageFinancial,
      permissionKeys.userManage,
      // Role management permissions
      permissionKeys.roleView,
      permissionKeys.roleManage,

      // Client management permissions
      permissionKeys.clientCreate,
      permissionKeys.clientViewAll,
      permissionKeys.clientViewOwn,
      permissionKeys.clientManageAll,
      permissionKeys.clientManageOwn,

      // Project management permissions
      permissionKeys.projectCreate,
      permissionKeys.projectViewAll,
      permissionKeys.projectViewOwn,
      permissionKeys.projectManageAll,
      permissionKeys.projectManageOwn,
      permissionKeys.projectFinanceManagement,

      // Task management permissions
      permissionKeys.taskViewAll,
      permissionKeys.taskViewOwn,
      // permissionKeys.taskManageAll,
      // permissionKeys.taskManageOwn,
      // permissionKeys.taskCreate,

      // Timesheet management permissions
      permissionKeys.timesheetViewAll,
    ],
  },
  {
    name: roleNames.manager,
    description: "Manages users, clients, projects, reports, and timesheets.",
    level: 80,
    permissions: [
      permissionKeys.profileView,
      permissionKeys.profileUpdate,
      permissionKeys.profileSecurityManage,

      // User management permissions
      permissionKeys.userView,
      permissionKeys.userInvite,
      permissionKeys.userManage,
      // Role management permissions
      permissionKeys.roleView,
      permissionKeys.roleManage,

      // Client management permissions
      permissionKeys.clientCreate,
      permissionKeys.clientViewOwn,
      permissionKeys.clientManageOwn,

      // Project management permissions
      permissionKeys.projectCreate,
      permissionKeys.projectViewOwn,
      permissionKeys.projectManageOwn,
      permissionKeys.projectFinanceManagement,

      // Task management permissions
      permissionKeys.taskViewOwn,
      permissionKeys.taskCreate,
      permissionKeys.taskManageOwn,

      // Timesheet management permissions
      permissionKeys.timesheetViewOwn,
      permissionKeys.timesheetCreate,
      permissionKeys.timesheetFill,
      permissionKeys.timesheetApprove,
      permissionKeys.timesheetSubmit,
    ],
  },
  {
    name: roleNames.teamLead,
    description: "Manages assigned team work and reviews team timesheets.",
    level: 60,
    permissions: [
      permissionKeys.profileView,
      permissionKeys.profileUpdate,
      permissionKeys.profileSecurityManage,
      // User management permissions

      permissionKeys.userView,
      permissionKeys.userInvite,
      // Role management permissions
      permissionKeys.roleView,
      permissionKeys.roleManage,

      // Project management permissions
      permissionKeys.projectViewOwn,
      permissionKeys.projectManageOwn,

      // Task management permissions
      permissionKeys.taskViewOwn,
      permissionKeys.taskCreate,
      permissionKeys.taskManageOwn,

      // Timesheet management permissions
      permissionKeys.timesheetViewOwn,
      permissionKeys.timesheetCreate,
      permissionKeys.timesheetFill,
      permissionKeys.timesheetApprove,
      permissionKeys.timesheetSubmit,
    ],
  },
  {
    name: roleNames.developer,
    description: "Works on assigned projects and manages own timesheets.",
    level: 40,
    permissions: [
      permissionKeys.profileView,
      permissionKeys.profileUpdate,
      permissionKeys.profileSecurityManage,
      permissionKeys.projectViewOwn,
      permissionKeys.taskViewOwn,
      permissionKeys.taskCreate,
      permissionKeys.taskManageOwn,
      permissionKeys.timesheetViewOwn,
      permissionKeys.timesheetFill,
      permissionKeys.timesheetSubmit,
    ],
  },
  {
    name: roleNames.guest,
    description: "Default limited access for newly registered users.",
    level: 10,
    isDefault: true,
    permissions: [
      permissionKeys.profileView,
      permissionKeys.profileUpdate,
      permissionKeys.profileSecurityManage,
    ],
  },
];

export async function seedRolePermissions() {
  const permissionValues = allPermissions.map((key) => ({
    key,
    description: key,
  }));

  await db
    .insert(permissions)
    .values(permissionValues)
    .onConflictDoUpdate({
      target: permissions.key,
      set: {
        description: sql`excluded.description`,
      },
    });

  await db
    .insert(roles)
    .values(
      seedRoles.map((role) => ({
        name: role.name,
        description: role.description,
        level: role.level,
        isDefault: role.isDefault ?? false,
      }))
    )
    .onConflictDoUpdate({
      target: roles.name,
      set: {
        description: sql`excluded.description`,
        level: sql`excluded.level`,
        isDefault: sql`excluded.is_default`,
      },
    });

  const seededRoleNames = seedRoles.map((role) => role.name);
  const seededPermissionKeys = allPermissions;

  const roleRecords = await db
    .select({ id: roles.id, name: roles.name })
    .from(roles)
    .where(inArray(roles.name, seededRoleNames));

  const permissionRecords = await db
    .select({ id: permissions.id, key: permissions.key })
    .from(permissions)
    .where(inArray(permissions.key, seededPermissionKeys));

  const roleIdByName = new Map(
    roleRecords.map((role) => [role.name as RoleName, role.id])
  );
  const permissionIdByKey = new Map(
    permissionRecords.map((permission) => [
      permission.key as PermissionKey,
      permission.id,
    ])
  );

  const seededRoleIds = roleRecords.map((role) => role.id);

  if (seededRoleIds.length > 0) {
    await db
      .delete(rolePermissions)
      .where(inArray(rolePermissions.roleId, seededRoleIds));
  }

  const rolePermissionValues = seedRoles.flatMap((role) => {
    const roleId = roleIdByName.get(role.name);

    if (!roleId) {
      throw new Error(`Seeded role '${role.name}' was not found.`);
    }

    return role.permissions.map((permission) => {
      const permissionId = permissionIdByKey.get(permission);

      if (!permissionId) {
        throw new Error(`Seeded permission '${permission}' was not found.`);
      }

      return {
        roleId,
        permissionId,
      };
    });
  });

  if (rolePermissionValues.length > 0) {
    await db
      .insert(rolePermissions)
      .values(rolePermissionValues)
      .onConflictDoNothing();
  }
}

if (process.argv[1]?.endsWith("role-permissions.ts")) {
  seedRolePermissions()
    .then(() => {
      // biome-ignore lint/suspicious/noConsole: Seed scripts report CLI status.
      console.log("Role permission seed completed.");
      process.exit(0);
    })
    .catch((error) => {
      // biome-ignore lint/suspicious/noConsole: Seed scripts report CLI status.
      console.error("Role permission seed failed.");
      // biome-ignore lint/suspicious/noConsole: Seed scripts report CLI errors.
      console.error(error);
      process.exit(1);
    });
}
