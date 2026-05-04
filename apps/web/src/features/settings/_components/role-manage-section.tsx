import { TabsContent } from "@workspace/ui/components/tabs";
import { SettingsSection } from "./settings-body";

import { useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Switch } from "@workspace/ui/components/switch";

import { AppIcon } from "@/shared/components/app-icon";
import { DataTable } from "@/shared/components/data-table";

import { fetchRoles } from "./mock-api";

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

type RoleRow = {
  id: number;
  name: string;
  description: string;
  permissionsCount: number;
  isDefault: boolean;
};

export function RolesTable() {
  const [search, setSearch] = useState("");
  const [rowLimit, setRowLimit] = useState(10);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["roles", search, rowLimit],
      queryFn: ({ pageParam }) =>
        fetchRoles({ pageParam, search, limit: rowLimit }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextPage,
    });

  // flatten pages
  const roles = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);

  function handleDefaultChange(selectedRole: RoleRow) {
    console.log("Set default:", selectedRole);
  }

  function handleRowClick(role: RoleRow) {
    console.log("Open role:", role);
  }

  function handleContextMenu(e: React.MouseEvent, role: RoleRow) {
    e.preventDefault();
    console.log("Right click:", role);
  }

  const columns = useMemo<ColumnDef<RoleRow>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => `#${row.original.id}`,
      },
      {
        accessorKey: "name",
        header: "Role",
      },
      {
        accessorKey: "description",
        header: "Description",
      },
      {
        accessorKey: "permissionsCount",
        header: "Permissions",
      },
      {
        accessorKey: "isDefault",
        header: "Default",
        cell: ({ row }) => (
          <Switch
            checked={row.original.isDefault}
            onClick={(e) => e.stopPropagation()}
            onCheckedChange={() => handleDefaultChange(row.original)}
          />
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4 border-t p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <AppIcon
            name="Search"
            className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          />

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles..."
            className="h-8 bg-transparent pl-8 text-[13px]"
          />
        </div>

        <Button size="sm" className="h-8 gap-1.5 text-[12px]">
          <AppIcon name="Plus" className="h-3.5 w-3.5" />
          Add Role
        </Button>
      </div>

      <DataTable
        data={roles}
        columns={columns}
        getRowId={(r) => String(r.id)}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        onRowClick={handleRowClick}
        onRowContextMenu={handleContextMenu}
        setRowLimit={setRowLimit}
        emptyText="No roles found"
      />
    </div>
  );
}

export { RoleManageSectionContent };
