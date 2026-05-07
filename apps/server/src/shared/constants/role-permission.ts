export const permissionKeys = {
  profileView: "profile:view",
  profileUpdate: "profile:update",
  profileSecurityManage: "profile:security-manage",
  // User management permissions
  userView: "user:view",
  userInvite: "user:invite",
  userManage: "user:manage",
  userManageFinancial: "user:manage-financial",
  userViewFinancial: "user:view-financial",

  // Role management permissions
  roleView: "role:view",
  roleManage: "role:manage",

  // Client management permissions
  clientCreate: "client:create",
  clientViewAll: "client:view:all",
  clientViewOwn: "client:view:own",
  clientManageAll: "client:manage:all",
  clientManageOwn: "client:manage:own",
} as const;

export const roleNames = {
  admin: "system-admin",
  manager: "manager",
  teamLead: "teamlead",
  developer: "developer",
  guest: "guest",
} as const;

export const defaultRoleName = roleNames.guest;

export type RoleName = (typeof roleNames)[keyof typeof roleNames];

export type PermissionKey =
  (typeof permissionKeys)[keyof typeof permissionKeys];
