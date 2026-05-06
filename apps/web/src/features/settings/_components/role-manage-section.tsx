import { useEffect, useMemo, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { TabsContent } from "@workspace/ui/components/tabs";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { toast } from "@workspace/ui/components/sonner";

import { AppIcon } from "@/shared/components/app-icon";
import { DataTable } from "@/shared/components/data-table";
import { settingsService } from "../settings.service";
import { SettingsSection } from "./settings-body";
import { cn } from "@workspace/ui/lib/utils";
import type { RoleListItem } from "../settings.type";

function PermissionsView({
  permissions,
  selected,
  onToggle,
  disabled = false,
}: {
  permissions: { name: string; include: boolean }[];
  selected: Set<string>;
  onToggle: (name: string, checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid max-h-72 grid-cols-1 gap-2 overflow-auto rounded-md border p-3 md:grid-cols-2">
      {permissions.map((permission) => {
        const checked = selected.has(permission.name);
        return (
          <label
            key={permission.name}
            className="flex items-center gap-2 text-xs"
          >
            <Checkbox
              checked={checked}
              disabled={disabled}
              onCheckedChange={(value) =>
                onToggle(permission.name, Boolean(value))
              }
            />
            <span className="truncate">{permission.name}</span>
          </label>
        );
      })}
    </div>
  );
}

const RoleManageSectionContent = () => {
  return (
    <TabsContent value="roles" className="m-0">
      <SettingsSection
        title="Roles"
        description="Manage user roles and permissions."
      >
        <RolesTable />
      </SettingsSection>
    </TabsContent>
  );
};

function RolesTable() {
  const [search, setSearch] = useState("");
  const [rowLimit, setRowLimit] = useState(0);
  const [selectedRole, setSelectedRole] = useState<RoleListItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuState, setMenuState] = useState<{
    x: number;
    y: number;
    row: RoleListItem;
  } | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set()
  );
  const queryClient = useQueryClient();

  const rolesQuery = useInfiniteQuery({
    queryKey: ["roles", search, rowLimit],
    queryFn: async ({ pageParam }) => {
      const response = await settingsService.listRoles({
        page: pageParam,
        limit: rowLimit,
        q: search,
      });
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch roles");
      }
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    enabled: Boolean(rowLimit),
  });

  const permissionsQuery = useQuery({
    queryKey: ["role-permissions", selectedRole?.id],
    queryFn: async () => {
      if (selectedRole?.id) {
        const roleRes = await settingsService.viewRole(selectedRole.id);
        if (!roleRes.success || !roleRes.data) throw new Error(roleRes.message);
        return roleRes.data.permissions;
      }
      const res = await settingsService.listPermissions();
      if (!res.success || !res.data) throw new Error(res.message);
      return res.data.permissions;
    },
    enabled: dialogOpen,
  });

  const createRoleMutation = useMutation({
    mutationFn: async () => {
      const response = await settingsService.createRole({
        name: form.name,
        description: form.description,
        permissions: Array.from(selectedPermissions),
      });
      if (!response.success) throw new Error(response.message);
      return response;
    },
    onSuccess: () => {
      toast.success("Role created successfully");
      setDialogOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRole) return;
      const response = await settingsService.updateRole(selectedRole.id, {
        name: form.name,
        description: form.description,
        permissions: Array.from(selectedPermissions),
      });
      if (!response.success) throw new Error(response.message);
      return response;
    },
    onSuccess: () => {
      toast.success("Role updated successfully");
      setDialogOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const toggleRoleStatusMutation = useMutation({
    mutationFn: async (role: RoleListItem) => {
      const response = await settingsService.toggleRoleStatus(role.id);
      if (!response.success) throw new Error(response.message);
      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Role status updated successfully");
      void queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const roles = useMemo(
    () => rolesQuery.data?.pages.flatMap((p) => p.items) ?? [],
    [rolesQuery.data]
  );

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
      { accessorKey: "permissionsCount", header: "Permissions" },
      {
        accessorKey: "isActive",
        header: "Is Active",
        cell: ({ row }) => {
          const role = row.original;
          return (
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-6 w-14 rounded-md text-xs py-1.5 cursor-pointer",
                role.isActive ? "bg-foreground text-background " : ""
              )}
              disabled={role.isDefault || toggleRoleStatusMutation.isPending}
              onClick={(e) => {
                e.stopPropagation();
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
    setForm({ name: "", description: "" });
    setSelectedPermissions(new Set());
    setDialogOpen(true);
  }

  function openEdit(role: RoleListItem) {
    setSelectedRole(role);
    setForm({ name: role.name, description: role.description || "" });
    setDialogOpen(true);
  }

  function handleContextMenu(event: React.MouseEvent, role: RoleListItem) {
    event.preventDefault();
    setMenuState({ x: event.clientX, y: event.clientY, row: role });
  }

  function handleSave() {
    if (!form.name.trim()) {
      toast.error("Role name is required");
      return;
    }
    if (selectedRole) {
      updateRoleMutation.mutate();
      return;
    }
    createRoleMutation.mutate();
  }

  const permissionOptions = permissionsQuery.data ?? [];

  useEffect(() => {
    if (!dialogOpen || !permissionOptions.length) return;
    setSelectedPermissions(
      new Set(
        permissionOptions
          .filter((permission) => permission.include)
          .map((permission) => permission.name)
      )
    );
  }, [dialogOpen, permissionOptions]);

  return (
    <div className="space-y-4 border-t p-4" onClick={() => setMenuState(null)}>
      <div className="flex items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <AppIcon
            name="Search"
            className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by id, role name, description..."
            className="h-8 bg-transparent pl-8 text-[13px]"
          />
        </div>

        <Button
          size="sm"
          className="h-8 gap-1.5 text-[12px]"
          onClick={openCreate}
        >
          <AppIcon name="Plus" className="h-3.5 w-3.5" />
          Add Role
        </Button>
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
        onRowContextMenu={handleContextMenu}
        setRowLimit={setRowLimit}
        emptyText="No roles found"
      />

      {menuState ? (
        <div
          className="fixed z-50 w-44 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
          style={{ top: menuState.y, left: menuState.x }}
        >
          <button
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
            onClick={() => {
              openEdit(menuState.row);
              setMenuState(null);
            }}
          >
            <AppIcon name="Pencil" className="size-3.5" />
            Edit role
          </button>
          <button
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent disabled:opacity-50"
            disabled={
              menuState.row.isDefault || toggleRoleStatusMutation.isPending
            }
            onClick={() => {
              toggleRoleStatusMutation.mutate(menuState.row);
              setMenuState(null);
            }}
          >
            <AppIcon name="CircleOff" className="size-3.5" />
            {menuState.row.isActive ? "Disable role" : "Activate role"}
          </button>
        </div>
      ) : null}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRole ? "Edit Role" : "Create Role"}
            </DialogTitle>
            <DialogDescription>
              Configure role details and permissions for this role.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <p className="text-xs font-medium">Role Name</p>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter role name"
                  disabled={selectedRole?.isDefault}
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium">Description</p>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter description"
                  disabled={selectedRole?.isDefault}
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium">Permissions</p>
              <PermissionsView
                permissions={permissionOptions}
                selected={selectedPermissions}
                onToggle={(name, checked) => {
                  setSelectedPermissions((prev) => {
                    const next = new Set(prev);
                    if (checked) next.add(name);
                    else next.delete(name);
                    return next;
                  });
                }}
                disabled={Boolean(selectedRole?.isDefault)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                createRoleMutation.isPending ||
                updateRoleMutation.isPending ||
                Boolean(selectedRole?.isDefault)
              }
            >
              {selectedRole ? "Save changes" : "Create role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { RoleManageSectionContent };
