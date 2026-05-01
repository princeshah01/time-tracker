export const ROLE_NAMES = {
  ADMIN: "admin",
  MANAGER: "manager",
  TEAMLEAD: "teamlead",
  DEVELOPER: "developer",
  GUEST: "guest",
} as const;

export type RoleName = (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES];

export const DEFAULT_ROLE_NAME = ROLE_NAMES.GUEST;

export const PERMISSION_KEYS = {
  USER_INVITE: "user:invite",
  USER_VIEW: "user:view",
  ROLE_VIEW: "role:view",
  ROLE_MANAGE: "role:manage",
  TIMESHEET_CREATE: "timesheet:create",
  TIMESHEET_VIEW_OWN: "timesheet:view:own",
  TIMESHEET_VIEW_TEAM: "timesheet:view:team",
  TIMESHEET_SHARE: "timesheet:share",
  PROJECT_CREATE: "project:create",
  PROJECT_VIEW: "project:view",
  CLIENT_CREATE: "client:create",
  CLIENT_VIEW: "client:view",
} as const;

export type PermissionKey =
  (typeof PERMISSION_KEYS)[keyof typeof PERMISSION_KEYS];

export const INVITE_TOKEN_BYTES = 32;
export const INVITE_EXPIRY_DAYS = 7;
