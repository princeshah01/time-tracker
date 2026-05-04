import { Navigate } from "react-router-dom";

import { PageLoader } from "@/shared/components/loaders";
import { hasPermission } from "@/shared/lib";
import { useAuth } from "@/shared/hooks";

type Props = {
  children: React.ReactNode;
  requiredPermissions?: string[] | undefined;
};

export function ProtectedRoute({ children, requiredPermissions }: Props) {
  const { permissions, isAuthenticated, isHydrated, isLoading } = useAuth();
  const allowed = hasPermission(permissions, requiredPermissions);

  if (!isHydrated || isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
