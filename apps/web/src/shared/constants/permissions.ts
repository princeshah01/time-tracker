const permissions = {
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
} as const;

export { permissions };
