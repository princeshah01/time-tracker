// import { useAppSelector } from "@/app/store";
// import { hasPermission } from "../lib";

const PermissionsWrapper = ({
  children,
  requiredPermissions,
}: {
  children: React.ReactNode;
  requiredPermissions: string[];
}) => {
  //TODO: will implement this once we have the permissions system in place. For now, it just renders the children regardless of permissions.
  // const {permissions: userPermissions} = useAppSelector(s=>s.user)
  // const hasRequiredPermissions = hasPermission(userPermissions, requiredPermissions);
  // return hasRequiredPermissions ? children : null;
  return children;
};

export { PermissionsWrapper };
