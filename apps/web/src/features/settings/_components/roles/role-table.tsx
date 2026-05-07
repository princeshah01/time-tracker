import { useEffect, useMemo, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import debounce from "lodash.debounce";

import { AppIcon } from "@/shared/components/app-icon";
import { DataTable } from "@/shared/components/data-table";
import { settingsService } from "@/features/settings/settings.service";
import type { RoleListItem } from "@/features/settings/settings.type";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { toast } from "@workspace/ui/components/sonner";
import { cn } from "@workspace/ui/lib/utils";

import { RoleViewDialog } from "./role-dialog";
import { RoleTableContextMenu } from "./role-context-menu";
import { PermissionsWrapper } from "@/shared/components/permission-wrapper";
import { permissions } from "@/shared/constants";
import { useAppSelector } from "@/app/store/hooks";
import { hasPermission } from "@/shared/lib/permissions";

type RoleTableFilterProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

const RoleTableFilter = ({ search, onSearchChange }: RoleTableFilterProps) => {
  return (
    <div className="relative max-w-sm flex-1">
      <AppIcon
        name="Search"
        className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
      />

      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search by id, role name, description..."
        variant="search"
        className="pl-8 text-[13px]"
      />
    </div>
  );
};

const RoleTable = () => {
  const queryClient = useQueryClient();

  const {permissions: userPermissions} = useAppSelector((s) => s.user);
  const canManageRoles = hasPermission(userPermissions, [permissions.roleManage]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // search debounce

  const debouncedFn = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value);
      }, 500),
    []
  );

  useEffect(() => {
    debouncedFn(search);

    return () => {
      debouncedFn.cancel();
    };
  }, [search, debouncedFn]);

  const [rowLimit, setRowLimit] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleListItem | null>(null);

  const [menuState, setMenuState] = useState<{
    x: number;
    y: number;
    row: RoleListItem;
  } | null>(null);

  const rolesQuery = useInfiniteQuery({
    queryKey: ["roles", debouncedSearch, rowLimit],
    enabled: Boolean(rowLimit),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await settingsService.listRoles({
        page: pageParam,
        limit: rowLimit,
        q: debouncedSearch,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch roles");
      }

      return response.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
  });

  const toggleRoleStatusMutation = useMutation({
    mutationFn: async (role: RoleListItem) => {
      const response = await settingsService.toggleRoleStatus(role.id);

      if (!response.success) {
        throw new Error(response.message || "Failed to update role status");
      }

      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Role status updated successfully");
      void queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const roles = useMemo(() => {
    return rolesQuery.data?.pages.flatMap((page) => page.items) ?? [];
  }, [rolesQuery.data]);

  const columns = useMemo<ColumnDef<RoleListItem>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => `#${row.original.id}`,
      },
      {
        accessorKey: "name",
        header: "Role Name",
        cell: ({ row }) => (
          <span
            className="block truncate font-medium"
            title={row.original.name}
          >
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <span
            className="block truncate text-muted-foreground"
            title={row.original.description || "-"}
          >
            {row.original.description || "-"}
          </span>
        ),
      },
      {
        accessorKey: "permissionsCount",
        header: "Permissions",
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
          const role = row.original;

          return (
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-5 w-10 rounded-md text-[10px] transition-colors",

                role.isActive
                  ? "border-success bg-success/10 text-success hover:bg-success/20 hover:text-success"
                  : "border-muted bg-muted text-muted-foreground hover:bg-muted/80 hover:text-muted-foreground"
              )}
              disabled={role.isDefault || toggleRoleStatusMutation.isPending || !canManageRoles}
              onClick={(event) => {
                event.stopPropagation();
                toggleRoleStatusMutation.mutate(role);
              }}
            >
              {role.isActive ? "Active" : "Inactive"}
            </Button>
          );
        },
      },
      {
        accessorKey: "isDefault",
        header: "Type",
        cell: ({ row }) =>
          row.original.isDefault ? (
            <Badge variant="secondary">Default</Badge>
          ) : (
            <Badge variant="outline">Custom</Badge>
          ),
      },
    ],
    [toggleRoleStatusMutation]
  );

  function openCreate() {
    setSelectedRole(null);
    setDialogOpen(true);
  }

  function openEdit(role: RoleListItem) {
    setSelectedRole(role);
    setDialogOpen(true);
  }

  function handleRowContextMenu(event: React.MouseEvent, role: RoleListItem) {
    event.preventDefault();
    setMenuState({
      x: event.clientX,
      y: event.clientY,
      row: role,
    });
  }

  return (
    <div className="space-y-4 border-t p-4" onClick={() => setMenuState(null)}>
      <div className="flex items-center justify-between gap-3">
        <RoleTableFilter search={search} onSearchChange={setSearch} />
        <PermissionsWrapper requiredPermissions={[permissions.roleManage]}>
        <Button
          size="sm"
          className="h-8 gap-1.5 text-[12px]"
          onClick={openCreate}
        >
          <AppIcon name="Plus" className="h-3.5 w-3.5" />
          Add Role
        </Button>
        </PermissionsWrapper>
      </div>

      <DataTable
        data={roles}
        columns={columns}
        getRowId={(row) => String(row.id)}
        isLoading={rolesQuery.isLoading}
        hasNextPage={rolesQuery.hasNextPage}
        isFetchingNextPage={rolesQuery.isFetchingNextPage}
        fetchNextPage={rolesQuery.fetchNextPage}
        onRowClick={openEdit}
        onRowContextMenu={handleRowContextMenu}
        setRowLimit={setRowLimit}
        emptyText="No roles found"
      />
      <PermissionsWrapper requiredPermissions={[permissions.roleManage]}>
      <RoleTableContextMenu
        menuState={menuState}
        openEdit={openEdit}
        setMenuState={setMenuState}
        toggleRoleStatusMutation={toggleRoleStatusMutation}
      />
      </PermissionsWrapper>
      <RoleViewDialog
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        selectedRole={selectedRole}
      />
    </div>
  );
};

export { RoleTable };
