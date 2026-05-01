import { useAuth } from "@/shared/hooks/use-auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuth();
  return children;
}
