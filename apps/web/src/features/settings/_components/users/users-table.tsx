import { useMemo } from "react";
import type { InfiniteData } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/shared/components/data-table";
import { capitalize, formatTableDate } from "@/shared/lib";
import type { ListUsersResponse, UserListItem } from "@/features/users-mange";
import type {
  ResetPasswordMutation,
  UpdateUserMutation,
  UserMenuState,
} from "./users.types";
import {
  UserEmailVerifiedBadge,
  UserIdentityCell,
  UserResetPasswordButton,
  UserSkillsCell,
  UserStatusButton,
} from "./users-table-cells";

type UsersTableProps = {
  data?: InfiniteData<ListUsersResponse>;
  isLoading: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  setRowLimit: (limit: number) => void;
  onEdit: (user: UserListItem) => void;
  setMenuState: (state: UserMenuState) => void;
  updateUserMutation: Pick<UpdateUserMutation, "isPending" | "mutate">;
  resetPasswordMutation: Pick<ResetPasswordMutation, "isPending" | "mutate">;
};

function UsersTable({
  data,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  setRowLimit,
  onEdit,
  setMenuState,
  updateUserMutation,
  resetPasswordMutation,
}: UsersTableProps) {
  const users = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  const columns = useMemo<ColumnDef<UserListItem>[]>(
    () => [
      {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => <UserIdentityCell user={row.original} />,
        size: 260,
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => capitalize(row.original.roleName ?? "-"),
        size: 130,
      },
      {
        accessorKey: "skills",
        header: "Skills",
        cell: ({ row }) => <UserSkillsCell skills={row.original.skills} />,
        size: 230,
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }) => formatTableDate(row.original.createdAt),
        size: 120,
      },
      {
        accessorKey: "emailVerified",
        header: "Email",
        cell: ({ row }) => (
          <UserEmailVerifiedBadge verified={row.original.emailVerified} />
        ),
        size: 110,
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <UserStatusButton
            user={row.original}
            updateUserMutation={updateUserMutation}
          />
        ),
        size: 95,
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
          <UserResetPasswordButton
            user={row.original}
            resetPasswordMutation={resetPasswordMutation}
          />
        ),
        size: 65,
      },
    ],
    [resetPasswordMutation, updateUserMutation]
  );

  return (
    <DataTable
      data={users}
      columns={columns}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      setRowLimit={setRowLimit}
      onRowClick={(user) => {
        setMenuState(null);
        onEdit(user);
      }}
      onRowContextMenu={(event, user) => {
        setMenuState({
          x: event.clientX,
          y: event.clientY,
          row: user,
        });
      }}
      emptyText="No users found"
    />
  );
}

export { UsersTable };
