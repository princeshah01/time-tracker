import { Navigate } from "react-router-dom";
import { useAuth } from "@/shared/hooks/use-auth";
import { hasPermission } from "@/shared/lib";
import { PageLoader } from "@/shared/components/loaders";

type Props = {
  children: React.ReactNode;
  requiredPermissions?: string[] | undefined;
};

export function ProtectedRoute({ children, requiredPermissions }: Props) {
  const { permissions, isHydrated, isLoading } = useAuth();
  const userPermissions = permissions;
  const allowed = hasPermission(userPermissions, requiredPermissions);

  if (!isHydrated || isLoading) {
    return <PageLoader />;
  }

  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
