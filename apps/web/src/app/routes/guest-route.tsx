import { Navigate } from "react-router-dom";

import { PageLoader } from "@/shared/components/loaders";
import { useAuth } from "@/shared/hooks";

type Props = {
  children: React.ReactNode;
};

export function GuestRoute({ children }: Props) {
  const { isAuthenticated, isHydrated, isLoading } = useAuth();

  if (!isHydrated || isLoading) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
