import { useEffect, useMemo, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import debounce from "lodash.debounce";
import { toast } from "@workspace/ui/components/sonner";

import { settingsService } from "@/features/settings";
import { userManageService } from "@/features/users-mange";
import type { UpdateUserInput, UserListItem } from "@/features/users-mange";
import { permissions, QUERY_KEYS } from "@/shared/constants";
import { UserDetailDialog } from "./user-detail-dialog";
import type { StatusFilterValue, UserMenuState } from "./users.types";
import { UsersContextMenu } from "./users-context-menu";
import { UsersFilters } from "./users-filters";
import { UsersTable } from "./users-table";
import { PermissionsWrapper } from "@/shared/components/permission-wrapper";

function UsersManagementContent() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<StatusFilterValue>("all");
  const [role, setRole] = useState("all");
  const [rowLimit, setRowLimit] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [menuState, setMenuState] = useState<UserMenuState>(null);

  const debouncedFn = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value.trim());
      }, 500),
    []
  );

  useEffect(() => {
    debouncedFn(search);

    return () => {
      debouncedFn.cancel();
    };
  }, [search, debouncedFn]);

  const rolesQuery = useQuery({
    queryKey: [QUERY_KEYS.ASSIGNABLE_ROLES],
    queryFn: async () => {
      const response = await settingsService.listAssignableRoles();

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch roles");
      }

      return response.data.assignableRoles;
    },
  });

  const usersQuery = useInfiniteQuery({
    queryKey: [QUERY_KEYS.USERS, debouncedSearch, status, role, rowLimit],
    enabled: Boolean(rowLimit),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await userManageService.listUsers({
        page: pageParam,
        limit: rowLimit,
        q: debouncedSearch,
        status: status === "all" ? undefined : status,
        role: role === "all" ? undefined : role,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch users");
      }

      return response.data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
  });

  const updateUserMutation = useMutation({
    mutationFn: async (input: { userId: string; data: UpdateUserInput }) => {
      const response = await userManageService.updateUser(
        input.userId,
        input.data
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update user");
      }

      return response.data;
    },
    onSuccess: (user) => {
      toast.success("User updated successfully");
      setSelectedUser((current) => (current?.id === user.id ? user : current));
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USER_DETAIL, user.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await userManageService.sendPasswordReset(userId);

      if (!response.success) {
        throw new Error(response.message || "Failed to send reset email");
      }

      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Password reset email sent");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="space-y-4 border-t p-4">
      <UsersFilters
        search={search}
        status={status}
        role={role}
        roles={rolesQuery.data ?? []}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onRoleChange={setRole}
      />

      <UsersTable
        data={usersQuery.data}
        isLoading={usersQuery.isLoading}
        hasNextPage={usersQuery.hasNextPage}
        isFetchingNextPage={usersQuery.isFetchingNextPage}
        fetchNextPage={usersQuery.fetchNextPage}
        setRowLimit={setRowLimit}
        onEdit={setSelectedUser}
        setMenuState={setMenuState}
        updateUserMutation={updateUserMutation}
        resetPasswordMutation={resetPasswordMutation}
      />
      <PermissionsWrapper requiredPermissions={[permissions.userInvite]}>
      <UsersContextMenu
        menuState={menuState}
        setMenuState={setMenuState}
        openEdit={setSelectedUser}
        updateUserMutation={updateUserMutation}
        resetPasswordMutation={resetPasswordMutation}
      />
      </PermissionsWrapper>
      <PermissionsWrapper requiredPermissions={[permissions.profileView]}>
        <UserDetailDialog
          user={selectedUser}
          roles={rolesQuery.data ?? []}
          open={Boolean(selectedUser)}
          onOpenChange={(open) => {
            if (!open) setSelectedUser(null);
          }}
        />
      </PermissionsWrapper>
    </div>
  );
}

export { UsersManagementContent };
