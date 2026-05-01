import { useAuth } from "@/shared/hooks/use-auth";
import { hasPermission } from "@/shared/lib";

type PermissionGuardProps = {
  permissions?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function PermissionGuard({
  permissions,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const auth = useAuth();

  if (!hasPermission(auth.permissions, permissions)) {
    return fallback;
  }

  return children;
}
