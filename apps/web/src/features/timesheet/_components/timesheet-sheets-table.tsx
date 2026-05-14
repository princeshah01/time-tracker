import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { toast } from "@workspace/ui/components/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAppSelector } from "@/app/store";
import { AppIcon } from "@/shared/components/app-icon";
import { permissions, QUERY_KEYS } from "@/shared/constants";
import { formatDate, hasPermission } from "@/shared/lib";
import { timesheetService } from "../service";
import type {
  TimesheetSheetRow,
  TimesheetTaskSuggestion,
  UpsertTimesheetSheetInput,
} from "../timesheet.types";

const ROW_HEIGHT = 44;
const ROW_BUFFER = 8;
const ALL_USERS = "__all__";
const HOUR_OPTIONS = Array.from({ length: 25 }, (_, index) => index);
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) => index);

type TimesheetSheetsTableProps = {
  timesheetId: number;
};

function TimesheetSheetsTable({ timesheetId }: TimesheetSheetsTableProps) {
  const queryClient = useQueryClient();
  const { permissions: userPermissions } = useAppSelector(
    (state) => state.user
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastLimitRef = useRef<number | null>(null);
  const [pageLimit, setPageLimit] = useState(30);
  const [selectedUserId, setSelectedUserId] = useState(ALL_USERS);
  const [editingRow, setEditingRow] = useState<TimesheetSheetRow | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const calculateLimit = () => {
      const nextLimit = Math.max(
        15,
        Math.ceil(el.clientHeight / ROW_HEIGHT) + ROW_BUFFER
      );

      if (lastLimitRef.current === nextLimit) return;

      lastLimitRef.current = nextLimit;
      setPageLimit(nextLimit);
    };

    calculateLimit();

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(calculateLimit);
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  const sheetsQuery = useInfiniteQuery({
    queryKey: [
      QUERY_KEYS.TIMESHEET_SHEETS,
      timesheetId,
      selectedUserId,
      pageLimit,
    ],
    enabled: Number.isFinite(timesheetId) && timesheetId > 0,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await timesheetService.listSheets({
        timesheetId,
        page: pageParam,
        limit: pageLimit,
        userId: selectedUserId === ALL_USERS ? undefined : selectedUserId,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch timesheet sheets");
      }

      return response.data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
  });

  const rows = useMemo(
    () => sheetsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [sheetsQuery.data]
  );
  const firstPage = sheetsQuery.data?.pages[0];
  const canManageAllUsers = Boolean(firstPage?.canManageAllUsers);
  const canFillTimesheet = hasPermission(userPermissions, [
    permissions.timesheetFill,
  ]);
  const visibleColumnCount = canManageAllUsers ? 5 : 4;

  const saveMutation = useMutation({
    mutationFn: async (input: UpsertTimesheetSheetInput) => {
      const response = await timesheetService.upsertSheet(timesheetId, input);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to save sheet row");
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success("Timesheet row saved");
      setEditingRow(null);
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TIMESHEET_SHEETS, timesheetId],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const el = event.currentTarget;
      const isNearBottom =
        el.scrollTop + el.clientHeight >= el.scrollHeight - ROW_HEIGHT * 2;

      if (
        isNearBottom &&
        sheetsQuery.hasNextPage &&
        !sheetsQuery.isFetchingNextPage
      ) {
        void sheetsQuery.fetchNextPage();
      }
    },
    [sheetsQuery]
  );

  if (sheetsQuery.isError) {
    return <TimesheetSheetsError onRetry={() => void sheetsQuery.refetch()} />;
  }

  return (
    <section className="min-h-0 rounded-md border border-border bg-card">
      <div className="flex h-11 items-center justify-between gap-3 border-b border-border px-3">
        <div className="flex min-w-0 items-center gap-2">
          <AppIcon
            name="FileSpreadsheet"
            className="size-3.5 text-muted-foreground"
          />
          <div className="min-w-0">
            <h2 className="truncate text-[13px] font-medium">Sheets</h2>
            <p className="text-[11px] text-muted-foreground">
              {firstPage ? `${firstPage.total} rows` : "Loading rows"}
            </p>
          </div>
        </div>

        {canManageAllUsers ? (
          <Select
            value={selectedUserId}
            onValueChange={(value) => {
              setEditingRow(null);
              setSelectedUserId(value);
            }}
          >
            <SelectTrigger className="h-8 w-56 text-[12px]">
              <SelectValue placeholder="All users" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value={ALL_USERS}>All users</SelectItem>
              {firstPage?.users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>

      <div
        ref={containerRef}
        className="h-[calc(100vh-250px)] min-h-80 overflow-auto"
        onScroll={handleScroll}
      >
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow className="hover:bg-card">
              <TableHead className="h-9 w-36 px-3 text-[12px]">Date</TableHead>
              {canManageAllUsers ? (
                <TableHead className="h-9 w-56 px-3 text-[12px]">
                  User
                </TableHead>
              ) : null}
              <TableHead className="h-9 min-w-72 px-3 text-[12px]">
                Task
              </TableHead>
              <TableHead className="h-9 w-32 px-3 text-[12px]">Time</TableHead>
              <TableHead className="h-9 w-20 px-3 text-right text-[12px]">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sheetsQuery.isLoading ? (
              <TimesheetSheetSkeletonRows
                columnCount={visibleColumnCount}
                rowCount={Math.min(pageLimit, 18)}
              />
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumnCount}
                  className="h-52 text-center text-[12px] text-muted-foreground"
                >
                  No rows found
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TimesheetSheetDisplayRows
                  key={row.rowKey}
                  canManageAllUsers={canManageAllUsers}
                  isEditing={editingRow?.rowKey === row.rowKey}
                  isSaving={saveMutation.isPending}
                  canFillTimesheet={canFillTimesheet}
                  row={row}
                  timesheetId={timesheetId}
                  visibleColumnCount={visibleColumnCount}
                  onCancelEdit={() => setEditingRow(null)}
                  onEdit={() => setEditingRow(row)}
                  onSave={(input) => saveMutation.mutate(input)}
                />
              ))
            )}

            {sheetsQuery.isFetchingNextPage && !sheetsQuery.isLoading ? (
              <TimesheetSheetSkeletonRows
                columnCount={visibleColumnCount}
                rowCount={4}
              />
            ) : null}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function TimesheetSheetDisplayRows({
  row,
  timesheetId,
  canManageAllUsers,
  isEditing,
  isSaving,
  canFillTimesheet,
  visibleColumnCount,
  onEdit,
  onCancelEdit,
  onSave,
}: {
  row: TimesheetSheetRow;
  timesheetId: number;
  canManageAllUsers: boolean;
  isEditing: boolean;
  isSaving: boolean;
  canFillTimesheet: boolean;
  visibleColumnCount: number;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (input: UpsertTimesheetSheetInput) => void;
}) {
  return (
    <>
      <TableRow className="h-11">
        <TableCell className="px-3 py-2 text-[12px]">
          {formatDate(row.date)}
        </TableCell>
        {canManageAllUsers ? (
          <TableCell className="px-3 py-2 text-[12px]">
            <div className="min-w-0">
              <p className="truncate">{row.user.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {row.user.email}
              </p>
            </div>
          </TableCell>
        ) : null}
        <TableCell className="px-3 py-2">
          <button
            type="button"
            className="flex min-h-7 w-full min-w-0 items-center gap-2 rounded-sm px-1 text-left hover:bg-muted/50"
            disabled={!canFillTimesheet}
            onClick={onEdit}
          >
            {row.task ? (
              <>
                <span className="truncate text-[12px]">{row.task.title}</span>
                <StatusBadge status={row.task.status} />
              </>
            ) : (
              <span className="text-[12px] text-muted-foreground">
                Select task
              </span>
            )}
          </button>
        </TableCell>
        <TableCell className="px-3 py-2 text-[12px]">
          {formatSpentTime(row.minutesSpent)}
        </TableCell>
        <TableCell className="px-3 py-2 text-right">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[12px]"
            disabled={!canFillTimesheet}
            onClick={onEdit}
          >
            Edit
          </Button>
        </TableCell>
      </TableRow>
      {isEditing ? (
        <TableRow className="bg-muted/20 hover:bg-muted/20">
          <TableCell colSpan={visibleColumnCount} className="p-0">
            <TimesheetSheetRowEditor
              isSaving={isSaving}
              row={row}
              timesheetId={timesheetId}
              onCancel={onCancelEdit}
              onSave={onSave}
            />
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}

function TimesheetSheetRowEditor({
  row,
  timesheetId,
  isSaving,
  onCancel,
  onSave,
}: {
  row: TimesheetSheetRow;
  timesheetId: number;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (input: UpsertTimesheetSheetInput) => void;
}) {
  const [taskTitle, setTaskTitle] = useState(row.task?.title ?? "");
  const [selectedTask, setSelectedTask] =
    useState<TimesheetTaskSuggestion | null>(row.task);
  const [hours, setHours] = useState(String(row.hours));
  const [minutes, setMinutes] = useState(String(row.minutes));
  const [debouncedTaskTitle, setDebouncedTaskTitle] = useState(taskTitle);
  const taskTitleSearch = taskTitle.trim();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedTaskTitle(taskTitleSearch);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [taskTitleSearch]);

  const suggestionsQuery = useQuery({
    queryKey: [
      QUERY_KEYS.TIMESHEET_TASK_SUGGESTIONS,
      timesheetId,
      row.rowKey,
      debouncedTaskTitle,
    ],
    enabled: debouncedTaskTitle.length > 0,
    queryFn: async () => {
      const response = await timesheetService.searchSheetTasks({
        timesheetId,
        q: debouncedTaskTitle,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch tasks");
      }

      return response.data;
    },
  });

  const totalMinutes = Number(hours) * 60 + Number(minutes);
  const normalizedTitle = taskTitleSearch.replace(/\s+/g, " ");
  const exactMatch = suggestionsQuery.data?.find(
    (task) => task.title.toLowerCase() === normalizedTitle.toLowerCase()
  );
  const taskForSave = selectedTask ?? exactMatch ?? null;
  const canSave =
    totalMinutes === 0 || taskForSave || normalizedTitle.length > 1;

  const handleSave = () => {
    onSave({
      entryDate: row.date,
      userId: row.user.id,
      taskId: taskForSave?.id ?? null,
      taskTitle: taskForSave ? undefined : normalizedTitle,
      hours: Number(hours),
      minutes: Number(minutes),
    });
  };

  const handleClear = () => {
    onSave({
      entryDate: row.date,
      userId: row.user.id,
      taskId: null,
      hours: 0,
      minutes: 0,
    });
  };

  return (
    <div className="border-t border-dashed border-border bg-background p-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="min-w-0">
          <Textarea
            className="min-h-28 resize-y text-[13px]"
            placeholder="Search task or type a new task title"
            value={taskTitle}
            onChange={(event) => {
              setTaskTitle(event.target.value);
              setSelectedTask(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                onCancel();
              }

              if (event.ctrlKey && event.key === "Enter" && canSave) {
                handleSave();
              }
            }}
          />

          <div className="mt-2 overflow-hidden rounded-md border border-border bg-card">
            {suggestionsQuery.isLoading ? (
              <div className="space-y-1 p-2">
                <Skeleton className="h-7" />
                <Skeleton className="h-7" />
              </div>
            ) : suggestionsQuery.data && suggestionsQuery.data.length > 0 ? (
              <div className="max-h-44 divide-y divide-border overflow-auto">
                {suggestionsQuery.data.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[12px] hover:bg-muted/50",
                      selectedTask?.id === task.id && "bg-muted"
                    )}
                    onClick={() => {
                      setSelectedTask(task);
                      setTaskTitle(task.title);
                    }}
                  >
                    <span className="truncate">{task.title}</span>
                    <StatusBadge status={task.status} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-3 py-2 text-[12px] text-muted-foreground">
                No matching task found
              </div>
            )}

            {normalizedTitle && !taskForSave ? (
              <div className="border-t border-border px-3 py-2 text-[12px]">
                Save will create todo task:{" "}
                <span className="font-medium">{normalizedTitle}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="mb-1 text-[11px] text-muted-foreground">Hours</p>
              <Select
                value={hours}
                onValueChange={(value) => {
                  setHours(value);
                  if (value === "24") setMinutes("0");
                }}
              >
                <SelectTrigger className="h-8 text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOUR_OPTIONS.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="mb-1 text-[11px] text-muted-foreground">Minutes</p>
              <Select
                value={minutes}
                onValueChange={setMinutes}
                disabled={hours === "24"}
              >
                <SelectTrigger className="h-8 text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MINUTE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border bg-muted/20 px-3 py-2 text-[12px]">
            <p className="text-[11px] text-muted-foreground">Selected time</p>
            <p>{formatSpentTime(totalMinutes)}</p>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-[12px]"
              disabled={isSaving}
              onClick={handleClear}
            >
              Set NULL
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-[12px]"
              disabled={isSaving}
              onClick={onCancel}
            >
              Cancel
              <span className="rounded border border-border px-1 text-[10px] text-muted-foreground">
                Esc
              </span>
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 gap-1.5 text-[12px]"
              disabled={!canSave || isSaving}
              onClick={handleSave}
            >
              Save
              <span className="rounded border border-primary-foreground/30 px-1 text-[10px] text-primary-foreground/80">
                Ctrl+Enter
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimesheetSheetSkeletonRows({
  rowCount,
  columnCount,
}: {
  rowCount: number;
  columnCount: number;
}) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, index) => (
        <TableRow key={index} className="h-11">
          {Array.from({ length: columnCount }).map((__, cellIndex) => (
            <TableCell key={cellIndex} className="px-3 py-2">
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function TimesheetSheetsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-md border border-border text-center">
      <div>
        <h2 className="text-[13px] font-medium">Failed to load sheet rows</h2>
        <p className="text-[12px] text-muted-foreground">
          The timesheet sheet rows could not be fetched.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 text-[12px]"
        onClick={onRetry}
      >
        Retry
      </Button>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: TimesheetTaskSuggestion["status"];
}) {
  const label =
    status === "inprogress"
      ? "In progress"
      : status === "completed"
        ? "Completed"
        : "Todo";

  return (
    <Badge
      variant="outline"
      className="shrink-0 rounded-sm px-1.5 py-0 text-[11px]"
    >
      {label}
    </Badge>
  );
}

function formatSpentTime(minutesSpent: number) {
  if (minutesSpent <= 0) return "-";

  const hours = Math.floor(minutesSpent / 60);
  const minutes = minutesSpent % 60;

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;

  return `${minutes}m`;
}

export { TimesheetSheetsTable };
