import type { Role } from "./role_permissions";

export type Gender = "male" | "female" | "other";

export type User = {
  id: string;
  email: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  dob?: string | null;
  role?: Role | null;
  gender?: Gender | null;
};
