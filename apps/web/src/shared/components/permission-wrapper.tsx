import { useAppSelector } from "@/app/store";
import { hasPermission } from "@/shared/lib";

const PermissionsWrapper = ({
  children,
  requiredPermissions,
}: {
  children: React.ReactNode;
  requiredPermissions: string[];
}) => {
  const { permissions: userPermissions } = useAppSelector((s) => s.user);
  const hasRequiredPermissions = hasPermission(
    userPermissions,
    requiredPermissions
  );
  return hasRequiredPermissions ? children : null;
};

export { PermissionsWrapper };
