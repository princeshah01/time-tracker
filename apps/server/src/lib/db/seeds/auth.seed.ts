import "dotenv/config";

import { inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  permissions,
  rolePermissions,
  roles,
} from "@/lib/db/schema/auth-schema";
import {
  PERMISSION_KEYS,
  type PermissionKey,
  ROLE_NAMES,
  type RoleName,
} from "@/shared/constants/auth.constants";

type RoleSeed = {
  name: RoleName;
  description: string;
  isDefault: boolean;
};

type PermissionSeed = {
  key: PermissionKey;
  description: string;
};

const ROLE_SEEDS: RoleSeed[] = [
  {
    name: ROLE_NAMES.GUEST,
    description: "Limited access for invited or read-only users",
    isDefault: true,
  },
  {
    name: ROLE_NAMES.DEVELOPER,
    description: "Creates and views own timesheets and project context",
    isDefault: false,
  },
  {
    name: ROLE_NAMES.TEAMLEAD,
    description: "Reviews team timesheets and project work",
    isDefault: false,
  },
  {
    name: ROLE_NAMES.MANAGER,
    description: "Manages people, clients, projects, and team reporting",
    isDefault: false,
  },
  {
    name: ROLE_NAMES.ADMIN,
    description: "Full system administration access",
    isDefault: false,
  },
];

const PERMISSION_SEEDS: PermissionSeed[] = [
  {
    key: PERMISSION_KEYS.USER_INVITE,
    description: "Invite users",
  },
  {
    key: PERMISSION_KEYS.USER_VIEW,
    description: "View users",
  },
  {
    key: PERMISSION_KEYS.ROLE_VIEW,
    description: "View roles and permissions",
  },
  {
    key: PERMISSION_KEYS.ROLE_MANAGE,
    description: "Manage roles and permissions",
  },
  {
    key: PERMISSION_KEYS.TIMESHEET_CREATE,
    description: "Create timesheets",
  },
  {
    key: PERMISSION_KEYS.TIMESHEET_VIEW_OWN,
    description: "View own timesheets",
  },
  {
    key: PERMISSION_KEYS.TIMESHEET_VIEW_TEAM,
    description: "View team timesheets",
  },
  {
    key: PERMISSION_KEYS.TIMESHEET_SHARE,
    description: "Share timesheets",
  },
  {
    key: PERMISSION_KEYS.PROJECT_CREATE,
    description: "Create projects",
  },
  {
    key: PERMISSION_KEYS.PROJECT_VIEW,
    description: "View projects",
  },
  {
    key: PERMISSION_KEYS.CLIENT_CREATE,
    description: "Create clients",
  },
  {
    key: PERMISSION_KEYS.CLIENT_VIEW,
    description: "View clients",
  },
];

const ROLE_PERMISSION_SEEDS = {
  [ROLE_NAMES.GUEST]: [PERMISSION_KEYS.TIMESHEET_VIEW_OWN],
  [ROLE_NAMES.DEVELOPER]: [
    PERMISSION_KEYS.TIMESHEET_CREATE,
    PERMISSION_KEYS.TIMESHEET_VIEW_OWN,
    PERMISSION_KEYS.PROJECT_VIEW,
    PERMISSION_KEYS.CLIENT_VIEW,
  ],
  [ROLE_NAMES.TEAMLEAD]: [
    PERMISSION_KEYS.USER_VIEW,
    PERMISSION_KEYS.TIMESHEET_CREATE,
    PERMISSION_KEYS.TIMESHEET_VIEW_OWN,
    PERMISSION_KEYS.TIMESHEET_VIEW_TEAM,
    PERMISSION_KEYS.TIMESHEET_SHARE,
    PERMISSION_KEYS.PROJECT_VIEW,
    PERMISSION_KEYS.CLIENT_VIEW,
  ],
  [ROLE_NAMES.MANAGER]: [
    PERMISSION_KEYS.USER_INVITE,
    PERMISSION_KEYS.USER_VIEW,
    PERMISSION_KEYS.ROLE_VIEW,
    PERMISSION_KEYS.TIMESHEET_CREATE,
    PERMISSION_KEYS.TIMESHEET_VIEW_OWN,
    PERMISSION_KEYS.TIMESHEET_VIEW_TEAM,
    PERMISSION_KEYS.TIMESHEET_SHARE,
    PERMISSION_KEYS.PROJECT_CREATE,
    PERMISSION_KEYS.PROJECT_VIEW,
    PERMISSION_KEYS.CLIENT_CREATE,
    PERMISSION_KEYS.CLIENT_VIEW,
  ],
  [ROLE_NAMES.ADMIN]: Object.values(PERMISSION_KEYS),
} satisfies Record<RoleName, PermissionKey[]>;

async function seedRoles() {
  for (const role of ROLE_SEEDS) {
    await db
      .insert(roles)
      .values(role)
      .onConflictDoUpdate({
        target: roles.name,
        set: {
          description: role.description,
          isDefault: role.isDefault,
          updatedAt: new Date(),
        },
      });
  }

  return db.select().from(roles);
}

async function seedPermissions() {
  for (const permission of PERMISSION_SEEDS) {
    await db
      .insert(permissions)
      .values(permission)
      .onConflictDoUpdate({
        target: permissions.key,
        set: {
          description: permission.description,
          updatedAt: new Date(),
        },
      });
  }

  return db.select().from(permissions);
}

async function seedRolePermissions() {
  const seededRoles = await seedRoles();
  const seededPermissions = await seedPermissions();
  const roleByName = new Map(seededRoles.map((role) => [role.name, role]));
  const permissionByKey = new Map(
    seededPermissions.map((permission) => [permission.key, permission])
  );
  const roleIds = ROLE_SEEDS.map(
    (roleSeed) => roleByName.get(roleSeed.name)?.id
  ).filter((roleId): roleId is number => typeof roleId === "number");

  if (roleIds.length > 0) {
    await db
      .delete(rolePermissions)
      .where(inArray(rolePermissions.roleId, roleIds));
  }

  const rolePermissionRows = Object.entries(ROLE_PERMISSION_SEEDS).flatMap(
    ([roleName, permissionKeys]) => {
      const role = roleByName.get(roleName);

      if (!role) {
        throw new Error(`Missing role seed: ${roleName}`);
      }

      return permissionKeys.map((permissionKey) => {
        const permission = permissionByKey.get(permissionKey);

        if (!permission) {
          throw new Error(`Missing permission seed: ${permissionKey}`);
        }

        return {
          roleId: role.id,
          permissionId: permission.id,
        };
      });
    }
  );

  if (rolePermissionRows.length > 0) {
    await db.insert(rolePermissions).values(rolePermissionRows);
  }
}

export async function seedAuthData() {
  await seedRolePermissions();
}

seedAuthData()
  .then(() => {
    console.log("Seeded roles, permissions, and role permissions");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed auth data");
    console.error(error);
    process.exit(1);
  });
