export const permissionKeys = {
  userInvite: "users:invite",
  userView: "users:view",
  userManage: "users:manage",
  roleView: "role:view",
  roleManage: "role:manage",
  profileView: "profile:view",
  profileEdit: "profile:edit",
  clientCreate: "client:create",
  clientViewAll: "client:view:all",
  clientManageAll: "client:manage:all",
  clientViewOwn: "client:view:own",
  clientManageOwn: "client:manage:own",
  clientViewTeam: "client:view:team",
  clientManageTeam: "client:manage:team",
  projectCreate: "project:create",
  projectViewAll: "project:view:all",
  projectManageAll: "project:manage:all",
  projectViewOwn: "project:view:own",
  projectManageOwn: "project:manage:own",
  projectViewTeam: "project:view:team",
  projectManageTeam: "project:manage:team",
  timeSheetCreate: "timesheet:create",
  timeSheetViewTeam: "timesheet:view:team",
  timeSheetViewOwn: "timesheet:view:own",
  timeSheetViewAll: "timesheet:view:all",
  timeSheetManageOwn: "timesheet:manage:own",
  timeSheetManageAll: "timesheet:manage:all",
  timeSheetManageTeam: "timesheet:manage:team",
  dashboardView: "dashboard:view",
  analyticsView: "analytics:view",
} as const;

export const roleNames = {
  admin: "admin",
  manager: "manager",
  teamLead: "teamlead",
  developer: "developer",
  guest: "guest",
} as const;

export const defaultRoleName = roleNames.guest;

export type RoleName = (typeof roleNames)[keyof typeof roleNames];

export type PermissionKey =
  (typeof permissionKeys)[keyof typeof permissionKeys];
