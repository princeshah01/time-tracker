import { useAppSelector } from "@/app/store";

export function useAuth() {
  const { user, role, permissions, isAuthenticated, isLoading, isHydrated } =
    useAppSelector((state) => state.user);

  return {
    user,
    role,
    permissions,
    isAuthenticated,
    isLoading,
    isHydrated,
  };
}
