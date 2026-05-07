export const permissionKeys = {
  profileView: "profile:view",
  profileUpdate: "profile:update",
  profileSecurityManage: "password:update",
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
