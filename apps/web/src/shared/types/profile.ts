import type { Permission, Role } from "./role_permissions";
import type { User } from "./user";

export type ProfileUserInfo = Pick<
  User,
  | "id"
  | "email"
  | "name"
  | "image"
  | "emailVerified"
  | "twoFactorEnabled"
  | "hasPassword"
  | "hasMicrosoftAccount"
>;

export type ProfileMeResponse = {
  userInfo: ProfileUserInfo;
  role: Role | null;
  permissions: Permission[];
};

export type AuthStatePayload = {
  user: User;
  permissions: Permission[];
};

export type UpdateProfileInput = {
  name?: string;
  image?: string | null;
};
