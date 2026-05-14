const permissions = {
  profileView: "profile:view",
  profileUpdate: "profile:update",
  profileSecurityManage: "profile:security-manage",
  // User management permissions
  userView: "user:view",
  userInvite: "user:invite",
  userManage: "user:manage",
  userManageFinancial: "user:manage-financial",
  // Role management permissions
  roleView: "role:view",
  roleManage: "role:manage",
  // Client management permissions
  clientCreate: "client:create",
  clientViewAll: "client:view:all",
  clientViewOwn: "client:view:own",
  clientManageAll: "client:manage:all",
  clientManageOwn: "client:manage:own",
  // Project management permissions
  projectCreate: "project:create",
  projectViewAll: "project:view:all",
  projectViewOwn: "project:view:own",
  projectManageAll: "project:manage:all",
  projectManageOwn: "project:manage:own",
  projectFinanceManagement: "project:finance:management",
  // Task management permissions
  taskViewAll: "task:view:all",
  taskViewOwn: "task:view:own",
  taskCreate: "task:create",
  // Timesheet management permissions
  timesheetCreate: "timesheet:create",
  timesheetFill: "timesheet:fill",
  timesheetApprove: "timesheet:approve",
  timesheetSubmit: "timesheet:submit",
} as const;

export { permissions };
