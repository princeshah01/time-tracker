import type { InfiniteData } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useMemo } from "react";

import { DataTable } from "@/shared/components/data-table";
import { formatTableDate } from "@/shared/lib";
import type {
  ListTasksResponse,
  TaskListItem,
  TaskStatus,
} from "../task.types";
import { TASK_STATUS_OPTIONS, TaskStatusBadge } from "./task-status";

type TaskTableProps = {
  data?: InfiniteData<ListTasksResponse>;
  isLoading: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  setRowLimit: (limit: number) => void;
  canMutate: boolean;
  updatingTaskId?: number | null;
  updatingStatus?: boolean;
  onEdit: (task: TaskListItem) => void;
  onStatusChange: (task: TaskListItem, status: TaskStatus) => void;
};

function TaskTable({
  data,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  setRowLimit,
  canMutate,
  updatingTaskId,
  updatingStatus,
  onEdit,
  onStatusChange,
}: TaskTableProps) {
  const tasks = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  const columns = useMemo<ColumnDef<TaskListItem>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Task ID",
        cell: ({ row }) => `#${row.original.id}`,
        size: 80,
      },
      {
        accessorKey: "title",
        header: "Task",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div
              className="truncate text-[13px] font-medium"
              title={row.original.title}
            >
              {row.original.title}
            </div>
            <div
              className="truncate text-[12px] text-muted-foreground"
              title={row.original.description ?? ""}
            >
              {row.original.description || "No description"}
            </div>
          </div>
        ),
        size: 300,
      },
      {
        accessorKey: "project.name",
        header: "Project",
        cell: ({ row }) => (
          <span
            className="truncate text-[13px]"
            title={row.original.project.name}
          >
            {row.original.project.name}
          </span>
        ),
        size: 220,
      },
      {
        accessorKey: "creator.name",
        header: "Created By",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div
              className="truncate text-[13px]"
              title={row.original.creator.name}
            >
              {row.original.creator.name}
            </div>
            <div
              className="truncate text-[11px] text-muted-foreground"
              title={row.original.creator.email}
            >
              {row.original.creator.email}
            </div>
          </div>
        ),
        size: 220,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => formatTableDate(row.original.createdAt),
        size: 120,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) =>
          canMutate ? (
            <Select
              value={row.original.status}
              disabled={updatingStatus && updatingTaskId === row.original.id}
              onValueChange={(value) =>
                onStatusChange(row.original, value as TaskStatus)
              }
            >
              <SelectTrigger
                className="h-8 w-36 text-[12px]"
                onClick={(event) => event.stopPropagation()}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <TaskStatusBadge status={row.original.status} />
          ),
        size: 160,
      },
    ],
    [canMutate, onStatusChange, updatingStatus, updatingTaskId]
  );

  return (
    <DataTable
      data={tasks}
      columns={columns}
      getRowId={(row) => String(row.id)}
      isLoading={isLoading}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      setRowLimit={setRowLimit}
      onRowClick={onEdit}
      containerClassName="h-[calc(100vh-130px)]"
      emptyText="No tasks found"
    />
  );
}

export { TaskTable };
