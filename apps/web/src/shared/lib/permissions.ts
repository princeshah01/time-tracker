export const hasPermission = (
  userPermissions: string[],
  requiredPermissions?: string[]
) => {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission)
  );
};
