import { User, Permission, Role } from "@/shared/types";

export type MeResponse = {
  user: User;
  role: Role | null;
  permissions: Permission[];
};
