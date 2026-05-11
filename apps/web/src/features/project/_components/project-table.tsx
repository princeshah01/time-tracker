import { useMemo } from "react";
import type { InfiniteData } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/shared/components/data-table";
import { formatTableDate } from "@/shared/lib";
import type {
  ListProjectsResponse,
  ProjectListItem,
  ProjectMenuState,
} from "../project.types";
import {
  ProjectActionsCell,
  ProjectIdentityCell,
  ProjectManagerCell,
  ProjectStatusBadge,
} from "./project-table-cells";

type ProjectTableProps = {
  data?: InfiniteData<ListProjectsResponse>;
  isLoading: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  setRowLimit: (limit: number) => void;
  canManage: boolean;
  onView: (project: ProjectListItem) => void;
  onEdit: (project: ProjectListItem) => void;
  onToggleStatus: (project: ProjectListItem) => void;
  setMenuState: (state: ProjectMenuState) => void;
};

function ProjectTable({
  data,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  setRowLimit,
  canManage,
  onView,
  onEdit,
  onToggleStatus,
  setMenuState,
}: ProjectTableProps) {
  const projects = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  const columns = useMemo<ColumnDef<ProjectListItem>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Project ID",
        cell: ({ row }) => `#${row.original.id}`,
        size: 90,
      },
      {
        accessorKey: "name",
        header: "Project Name",
        cell: ({ row }) => <ProjectIdentityCell project={row.original} />,
        size: 260,
      },
      {
        accessorKey: "taskTotal",
        header: "Tasks",
        cell: ({ row }) => row.original.taskTotal ?? 0,
        size: 80,
      },
      {
        accessorKey: "teamMemberTotal",
        header: "Members",
        cell: ({ row }) => row.original.teamMemberTotal ?? 0,
        size: 90,
      },
      {
        id: "managerName",
        header: "Project Manager",
        cell: ({ row }) => <ProjectManagerCell project={row.original} />,
        size: 220,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => formatTableDate(row.original.createdAt),
        size: 120,
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <ProjectStatusBadge isActive={row.original.isActive} />
        ),
        size: 100,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <ProjectActionsCell
            project={row.original}
            canManage={canManage}
            onView={onView}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
          />
        ),
        size: 115,
      },
    ],
    [canManage, onEdit, onToggleStatus, onView]
  );

  return (
    <DataTable
      data={projects}
      columns={columns}
      getRowId={(row) => String(row.id)}
      isLoading={isLoading}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      setRowLimit={setRowLimit}
      onRowClick={(project) => {
        setMenuState(null);
        onView(project);
      }}
      onRowContextMenu={(event, project) => {
        setMenuState({
          x: event.clientX,
          y: event.clientY,
          row: project,
        });
      }}
      containerClassName="h-[calc(100vh-130px)]"
      emptyText="No projects found"
    />
  );
}

export { ProjectTable };
