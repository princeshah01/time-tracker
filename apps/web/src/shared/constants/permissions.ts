const permissions = {
  userAdd: "user:add",
  userEdit: "user:edit",
  userStatusChange: "user:status-change",
  userView: "user:view",
  roleAdd: "role:add",
  roleEdit: "role:edit",
  roleStatusChange: "role:status-change",
  roleDelete: "role:delete",
  roleView: "role:view",
  dashboardView: "dashboard:view",
  clientView: "client:view",
  projectView: "project:view",
  taskView: "task:view",
  timesheetView: "timesheet:view",
  analyticsView: "analytics:view",
  settingsView: "settings:view",
} as const;

export { permissions };
