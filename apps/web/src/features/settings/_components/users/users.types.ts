import type { UseMutationResult } from "@tanstack/react-query";

import type {
  UpdateUserInput,
  UserDetail,
  UserListItem,
  UserStatusFilter,
} from "@/features/users-mange";

export type StatusFilterValue = UserStatusFilter | "all";

export type UserMenuState = {
  x: number;
  y: number;
  row: UserListItem;
} | null;

export type UpdateUserMutation = UseMutationResult<
  UserDetail,
  Error,
  { userId: string; data: UpdateUserInput }
>;

export type ResetPasswordMutation = UseMutationResult<unknown, Error, string>;
