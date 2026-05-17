import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@workspace/ui/components/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Input } from "@workspace/ui/components/input";
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
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
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
  TimesheetUser,
  UpsertTimesheetSheetInput,
} from "../timesheet.types";

const ROW_HEIGHT = 44;
const ROW_BUFFER = 8;
const HOUR_OPTIONS = Array.from({ length: 25 }, (_, index) => index);
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) => index);

type TimesheetSheetsTableProps = {
  timesheetId: number;
};

type TaskLineState = {
  id: string;
  taskTitle: string;
  selectedTask: TimesheetTaskSuggestion | null;
  taskStatus: TimesheetTaskSuggestion["status"];
  hours: string;
  minutes: string;
};

function TimesheetSheetsTable({ timesheetId }: TimesheetSheetsTableProps) {
  const queryClient = useQueryClient();
  const { permissions: userPermissions, user } = useAppSelector(
    (state) => state.user
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastLimitRef = useRef<number | null>(null);
  const [pageLimit, setPageLimit] = useState(30);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<TimesheetSheetRow | null>(null);
  const [leaveConfirmRow, setLeaveConfirmRow] =
    useState<TimesheetSheetRow | null>(null);
  const [verificationConfirm, setVerificationConfirm] = useState<{
    userId: string;
    unfilledAvailableDays: number;
  } | null>(null);

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
        userId: selectedUserId ?? undefined,
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
  const tabUsers = firstPage?.users ?? [];
  const selectedSheet = firstPage?.selectedSheet ?? null;
  const defaultTabUser =
    tabUsers.find((tabUser) => tabUser.id === user?.id) ?? tabUsers[0] ?? null;
  const activeTabUserId = selectedUserId ?? defaultTabUser?.id ?? "";
  const canFillTimesheet = hasPermission(userPermissions, [
    permissions.timesheetFill,
  ]);
  const visibleColumnCount = canManageAllUsers ? 6 : 5;

  useEffect(() => {
    if (!canManageAllUsers || tabUsers.length === 0) return;
    if (
      selectedUserId &&
      tabUsers.some((tabUser) => tabUser.id === selectedUserId)
    ) {
      return;
    }

    const nextUser =
      tabUsers.find((tabUser) => tabUser.id === user?.id) ?? tabUsers[0];

    if (!nextUser) return;

    setEditingRow(null);
    setSelectedUserId(nextUser.id);
  }, [canManageAllUsers, selectedUserId, tabUsers, user?.id]);

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
  const leaveMutation = useMutation({
    mutationFn: async (input: { row: TimesheetSheetRow; isLeave: boolean }) => {
      const response = await timesheetService.setSheetLeave(timesheetId, {
        entryDate: input.row.date,
        isLeave: input.isLeave,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update leave day");
      }

      return response.data;
    },
    onSuccess: (_row, input) => {
      toast.success(
        input.isLeave ? "Day marked as leave" : "Leave removed from day"
      );
      setEditingRow(null);
      setLeaveConfirmRow(null);
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TIMESHEET_SHEETS, timesheetId],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
  const verificationMutation = useMutation({
    mutationFn: async (input: { userId: string; isVerified: boolean }) => {
      const response = await timesheetService.setSheetVerification(
        timesheetId,
        {
          userId: input.userId,
          isVerified: input.isVerified,
        }
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Failed to update sheet verification"
        );
      }

      return response.data;
    },
    onSuccess: (_user, input) => {
      toast.success(
        input.isVerified
          ? "Timesheet sheet verified"
          : "Timesheet sheet verification removed"
      );
      setVerificationConfirm(null);
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
    <>
      <section className="min-h-0 rounded-md border border-border bg-card">
        <div className="flex h-11 items-center justify-between gap-3 border-b border-border px-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="min-w-0">
              <h2 className="truncate text-[13px] font-medium">
                {selectedSheet?.user.name ?? "Sheets"}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {selectedSheet
                  ? `${selectedSheet.availableDays} available days`
                  : firstPage
                    ? `${firstPage.total} rows`
                    : "Loading sheet"}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-2">
            {selectedSheet?.verification.canVerify ? (
              <Button
                type="button"
                variant={
                  selectedSheet.verification.isVerified ? "outline" : "default"
                }
                size="sm"
                className="h-7 gap-1.5 text-[10px]"
                disabled={verificationMutation.isPending}
                onClick={() => {
                  const nextIsVerified = !selectedSheet.verification.isVerified;

                  if (
                    nextIsVerified &&
                    selectedSheet.unfilledAvailableDays > 0
                  ) {
                    setVerificationConfirm({
                      userId: selectedSheet.user.id,
                      unfilledAvailableDays:
                        selectedSheet.unfilledAvailableDays,
                    });
                    return;
                  }

                  verificationMutation.mutate({
                    userId: selectedSheet.user.id,
                    isVerified: nextIsVerified,
                  });
                }}
              >
                <AppIcon name="CheckCircle2" className="size-3" />
                {selectedSheet.verification.isVerified
                  ? "Remove verified"
                  : "Mark verified"}
              </Button>
            ) : null}
          </div>
        </div>

        <div
          ref={containerRef}
          className={cn(
            "h-[calc(100vh-228px)] min-h-80 overflow-auto",
            canManageAllUsers && tabUsers.length > 0 && "h-[calc(100vh-276px)]"
          )}
          onScroll={handleScroll}
        >
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow className="hover:bg-card">
                <TableHead className="h-9 w-40 px-3 text-[12px]">
                  Date
                </TableHead>
                {canManageAllUsers ? (
                  <TableHead className="h-9 w-56 px-3 text-[12px]">
                    User
                  </TableHead>
                ) : null}
                <TableHead className="h-9 min-w-72 px-3 text-[12px]">
                  Task
                </TableHead>
                <TableHead className="h-9 w-32 px-3 text-[12px]">
                  Time
                </TableHead>
                <TableHead className="h-9 w-32 px-3 text-[12px]">
                  Status
                </TableHead>
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
                    isUpdatingLeave={leaveMutation.isPending}
                    canFillTimesheet={canFillTimesheet}
                    currentUserId={user?.id ?? null}
                    row={row}
                    timesheetId={timesheetId}
                    visibleColumnCount={visibleColumnCount}
                    onCancelEdit={() => setEditingRow(null)}
                    onEdit={() => setEditingRow(row)}
                    onSetLeave={(isLeave) => {
                      if (isLeave) {
                        setLeaveConfirmRow(row);
                        return;
                      }

                      leaveMutation.mutate({ row, isLeave: false });
                    }}
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

        {canManageAllUsers && tabUsers.length > 0 ? (
          <UserTabs
            activeUserId={activeTabUserId}
            users={tabUsers}
            onChange={(nextUserId) => {
              setEditingRow(null);
              setSelectedUserId(nextUserId);
            }}
          />
        ) : null}
      </section>

      <AlertDialog
        open={Boolean(leaveConfirmRow)}
        onOpenChange={(open) => {
          if (!open && !leaveMutation.isPending) setLeaveConfirmRow(null);
        }}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[15px]">
              Mark this day as leave?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px]">
              All task entries already logged for{" "}
              {leaveConfirmRow ? formatDate(leaveConfirmRow.date) : "this day"}{" "}
              will be removed from your timesheet. This only affects your row.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="h-8 text-[12px]"
              disabled={leaveMutation.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-8 bg-destructive text-[12px] text-destructive-foreground hover:bg-destructive/90"
              disabled={leaveMutation.isPending || !leaveConfirmRow}
              onClick={() => {
                if (!leaveConfirmRow) return;
                leaveMutation.mutate({
                  row: leaveConfirmRow,
                  isLeave: true,
                });
              }}
            >
              Confirm leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(verificationConfirm)}
        onOpenChange={(open) => {
          if (!open && !verificationMutation.isPending) {
            setVerificationConfirm(null);
          }
        }}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[15px]">
              Verify incomplete timesheet?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px]">
              This sheet has {verificationConfirm?.unfilledAvailableDays ?? 0}{" "}
              available{" "}
              {(verificationConfirm?.unfilledAvailableDays ?? 0) === 1
                ? "day"
                : "days"}{" "}
              without filled time entries. Weekly off and explicit leave days
              are excluded from this count.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="h-8 text-[12px]"
              disabled={verificationMutation.isPending}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-8 text-[12px]"
              disabled={verificationMutation.isPending || !verificationConfirm}
              onClick={() => {
                if (!verificationConfirm) return;
                verificationMutation.mutate({
                  userId: verificationConfirm.userId,
                  isVerified: true,
                });
              }}
            >
              Verify anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function TimesheetSheetDisplayRows({
  row,
  timesheetId,
  canManageAllUsers,
  isEditing,
  isSaving,
  isUpdatingLeave,
  canFillTimesheet,
  currentUserId,
  visibleColumnCount,
  onEdit,
  onCancelEdit,
  onSetLeave,
  onSave,
}: {
  row: TimesheetSheetRow;
  timesheetId: number;
  canManageAllUsers: boolean;
  isEditing: boolean;
  isSaving: boolean;
  isUpdatingLeave: boolean;
  canFillTimesheet: boolean;
  currentUserId: string | null;
  visibleColumnCount: number;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSetLeave: (isLeave: boolean) => void;
  onSave: (input: UpsertTimesheetSheetInput) => void;
}) {
  const entries = getDisplayEntries(row);
  const isOwnRow = currentUserId === row.user.id;
  const canEditRow = canFillTimesheet && isOwnRow && !row.isLeave;
  const canToggleLeave = canFillTimesheet && isOwnRow && !row.isWeekend;
  const emptyTaskText = canEditRow
    ? "Select task"
    : "Timesheet for this date is not filled";

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <TableRow
            className={cn(
              "h-11",
              row.isLeave && "bg-destructive/5 hover:bg-destructive/10"
            )}
          >
            <TableCell className="px-3 py-2 text-[12px]">
              <div className="flex flex-wrap items-center gap-2">
                <span>{formatDate(row.date)}</span>
                <LeaveBadge row={row} />
              </div>
            </TableCell>
            {canManageAllUsers ? (
              <TableCell className="px-3 py-2 text-[12px]">
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate">{row.user.name}</p>
                    <RoleBadge role={row.user.role} />
                  </div>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {row.user.email}
                  </p>
                </div>
              </TableCell>
            ) : null}
            <TableCell className="px-3 py-2">
              <button
                type="button"
                className="flex min-h-7 w-full min-w-0 flex-col items-start gap-1 rounded-sm px-1 text-left hover:bg-muted disabled:cursor-default disabled:hover:bg-transparent"
                disabled={!canEditRow}
                onClick={onEdit}
                title={canEditRow ? "Edit timesheet entry" : undefined}
              >
                {row.isLeave ? (
                  <span className="text-[12px] text-muted-foreground">
                    {row.isWeekend ? "Weekly off" : "Leave day"}
                  </span>
                ) : entries.length > 0 ? (
                  entries.map((entry) => (
                    <span
                      key={entry.entryId}
                      className="flex max-w-full items-center gap-2"
                    >
                      <span className="truncate text-[12px]">
                        {entry.task?.title ?? "Untitled task"}
                      </span>
                      {entry.task ? (
                        <StatusBadge status={entry.task.status} />
                      ) : null}
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {formatSpentTime(entry.minutesSpent)}
                      </span>
                    </span>
                  ))
                ) : (
                  <span className="text-[12px] text-muted-foreground">
                    {emptyTaskText}
                  </span>
                )}
              </button>
            </TableCell>
            <TableCell className="px-3 py-2 text-[12px]">
              {formatSpentTime(row.minutesSpent)}
            </TableCell>
            <TableCell className="px-3 py-2 text-[12px]">
              <VerificationBadge row={row} />
            </TableCell>
            <TableCell className="px-3 py-2 text-right">
              <TimesheetSheetRowActions
                canEditRow={canEditRow}
                canToggleLeave={canToggleLeave}
                isUpdatingLeave={isUpdatingLeave}
                row={row}
                onEdit={onEdit}
                onSetLeave={onSetLeave}
              />
            </TableCell>
          </TableRow>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-44">
          <TimesheetSheetRowContextItems
            canEditRow={canEditRow}
            canToggleLeave={canToggleLeave}
            isUpdatingLeave={isUpdatingLeave}
            row={row}
            onEdit={onEdit}
            onSetLeave={onSetLeave}
          />
        </ContextMenuContent>
      </ContextMenu>
      {isEditing && canEditRow ? (
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

function UserTabs({
  activeUserId,
  users,
  onChange,
}: {
  activeUserId: string;
  users: TimesheetUser[];
  onChange: (userId: string) => void;
}) {
  return (
    <Tabs value={activeUserId} onValueChange={onChange}>
      <div className="border-t border-border bg-muted/20 px-2 py-2">
        <TabsList className="flex h-auto w-full justify-start overflow-x-auto rounded-none bg-transparent p-0">
          {users.map((user, index) => (
            <div key={user.id} className="flex items-center">
              <TabsTrigger
                value={user.id}
                className="h-8 max-w-56 shrink-0 gap-2 rounded-md border border-transparent px-3 text-[12px] data-[state=active]:border-border data-[state=active]:bg-background"
                title={`${user.name} (${user.email})`}
              >
                <span className="truncate">{user.name}</span>
                <RoleBadge role={user.role} />
              </TabsTrigger>

              {index !== users.length - 1 && (
                <div className="mx-1 h-4 w-px bg-border shrink-0" />
              )}
            </div>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
}

function TimesheetSheetRowActions({
  row,
  canEditRow,
  canToggleLeave,
  isUpdatingLeave,
  onEdit,
  onSetLeave,
}: {
  row: TimesheetSheetRow;
  canEditRow: boolean;
  canToggleLeave: boolean;
  isUpdatingLeave: boolean;
  onEdit: () => void;
  onSetLeave: (isLeave: boolean) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          aria-label="Open row actions"
        >
          <AppIcon name="MoreHorizontal" className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          className="gap-2 text-[12px]"
          disabled={!canEditRow}
          onSelect={onEdit}
        >
          <AppIcon name="Pencil" className="size-3.5" />
          Edit row
        </DropdownMenuItem>
        {row.isWeekend ? (
          <DropdownMenuItem className="gap-2 text-[12px]" disabled>
            <AppIcon name="CalendarDays" className="size-3.5" />
            Mandatory weekly off
          </DropdownMenuItem>
        ) : row.isExplicitLeave ? (
          <DropdownMenuItem
            className="gap-2 text-[12px]"
            disabled={!canToggleLeave || isUpdatingLeave}
            onSelect={() => onSetLeave(false)}
          >
            <AppIcon name="CalendarDays" className="size-3.5" />
            Unmark leave
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="gap-2 text-[12px]"
            disabled={!canToggleLeave || isUpdatingLeave}
            onSelect={() => onSetLeave(true)}
          >
            <AppIcon name="CalendarDays" className="size-3.5" />
            Mark as leave
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TimesheetSheetRowContextItems({
  row,
  canEditRow,
  canToggleLeave,
  isUpdatingLeave,
  onEdit,
  onSetLeave,
}: {
  row: TimesheetSheetRow;
  canEditRow: boolean;
  canToggleLeave: boolean;
  isUpdatingLeave: boolean;
  onEdit: () => void;
  onSetLeave: (isLeave: boolean) => void;
}) {
  return (
    <>
      <ContextMenuItem
        className="gap-2 text-[12px]"
        disabled={!canEditRow}
        onSelect={onEdit}
      >
        <AppIcon name="Pencil" className="size-3.5" />
        Edit row
      </ContextMenuItem>
      {row.isWeekend ? (
        <ContextMenuItem className="gap-2 text-[12px]" disabled>
          <AppIcon name="CalendarDays" className="size-3.5" />
          Mandatory weekly off
        </ContextMenuItem>
      ) : row.isExplicitLeave ? (
        <ContextMenuItem
          className="gap-2 text-[12px]"
          disabled={!canToggleLeave || isUpdatingLeave}
          onSelect={() => onSetLeave(false)}
        >
          <AppIcon name="CalendarDays" className="size-3.5" />
          Unmark leave
        </ContextMenuItem>
      ) : (
        <ContextMenuItem
          className="gap-2 text-[12px]"
          disabled={!canToggleLeave || isUpdatingLeave}
          onSelect={() => onSetLeave(true)}
        >
          <AppIcon name="CalendarDays" className="size-3.5" />
          Mark as leave
        </ContextMenuItem>
      )}
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
  const [lines, setLines] = useState<TaskLineState[]>(() =>
    createInitialTaskLines(row)
  );
  const totalMinutes = lines.reduce(
    (total, line) => total + Number(line.hours) * 60 + Number(line.minutes),
    0
  );
  const canSave = lines.every((line) => {
    const lineMinutes = Number(line.hours) * 60 + Number(line.minutes);
    const normalizedTitle = normalizeTaskTitle(line.taskTitle);

    return lineMinutes === 0 || line.selectedTask || normalizedTitle.length > 1;
  });

  const updateLine = (lineId: string, nextLine: TaskLineState) => {
    setLines((current) =>
      current.map((line) => (line.id === lineId ? nextLine : line))
    );
  };

  const addLine = () => {
    setLines((current) => [...current, createEmptyTaskLine()]);
  };

  const removeLine = (lineId: string) => {
    setLines((current) =>
      current.length === 1
        ? [createEmptyTaskLine()]
        : current.filter((line) => line.id !== lineId)
    );
  };

  const handleSave = () => {
    const entries = lines.reduce<
      NonNullable<UpsertTimesheetSheetInput["entries"]>
    >((items, line) => {
      const lineMinutes = Number(line.hours) * 60 + Number(line.minutes);
      const normalizedTitle = normalizeTaskTitle(line.taskTitle);

      if (lineMinutes === 0) return items;

      items.push({
        taskId: line.selectedTask?.id ?? null,
        taskTitle: line.selectedTask ? undefined : normalizedTitle,
        taskStatus: line.taskStatus,
        hours: Number(line.hours),
        minutes: Number(line.minutes),
      });

      return items;
    }, []);

    onSave({
      entryDate: row.date,
      userId: row.user.id,
      entries,
    });
  };

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.ctrlKey && event.key === "Enter") {
        event.preventDefault();
        if (canSave && !isSaving) handleSave();
      }
    };

    document.addEventListener("keydown", handleShortcut);

    return () => {
      document.removeEventListener("keydown", handleShortcut);
    };
  }, [canSave, isSaving, onCancel, handleSave]);

  return (
    <div className="bg-background p-3">
      <div className="space-y-3">
        <div className="space-y-2 border border-border bg-card">
          {lines.map((line, index) => (
            <TaskLineEditor
              key={line.id}
              line={line}
              lineIndex={index}
              timesheetId={timesheetId}
              rowKey={row.rowKey}
              canRemove={lines.length > 1}
              isLastLine={index === lines.length - 1}
              onCancel={onCancel}
              onSave={() => {
                if (canSave) handleSave();
              }}
              onAdd={addLine}
              onChange={(nextLine) => updateLine(line.id, nextLine)}
              onRemove={() => removeLine(line.id)}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <div className="py-1.5 text-[12px]">
            <span className="text-[11px] text-muted-foreground">
              Selected time:{" "}
            </span>
            <span>{formatSpentTime(totalMinutes)}</span>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-[12px]"
              disabled={isSaving}
              onClick={onCancel}
            >
              Cancel
              <ShortcutHint>Esc</ShortcutHint>
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 gap-1.5 text-[12px]"
              disabled={!canSave || isSaving}
              onClick={handleSave}
            >
              Save
              <ShortcutHint>Ctrl+Enter</ShortcutHint>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskLineEditor({
  line,
  lineIndex,
  timesheetId,
  rowKey,
  canRemove,
  isLastLine,
  onCancel,
  onSave,
  onAdd,
  onChange,
  onRemove,
}: {
  line: TaskLineState;
  lineIndex: number;
  timesheetId: number;
  rowKey: string;
  canRemove: boolean;
  isLastLine: boolean;
  onCancel: () => void;
  onSave: () => void;
  onAdd: () => void;
  onChange: (line: TaskLineState) => void;
  onRemove: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [debouncedTaskTitle, setDebouncedTaskTitle] = useState(
    normalizeTaskTitle(line.taskTitle)
  );
  const taskTitleSearch = normalizeTaskTitle(line.taskTitle);

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
      rowKey,
      line.id,
      debouncedTaskTitle,
    ],
    enabled: isOpen && debouncedTaskTitle.length > 0,
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
  const suggestions = suggestionsQuery.data ?? [];

  useEffect(() => {
    setActiveIndex(0);
  }, [suggestions.length, isOpen]);

  const selectTask = (task: TimesheetTaskSuggestion) => {
    onChange({
      ...line,
      taskTitle: task.title,
      selectedTask: task,
      taskStatus: task.status,
    });
    setIsOpen(false);
  };

  const handleTaskKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
      return;
    }

    if (event.ctrlKey && event.key === "Enter") {
      event.preventDefault();
      onSave();
      return;
    }

    if (!isOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setIsOpen(true);
      return;
    }

    if (!isOpen || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(
        (current) => (current - 1 + suggestions.length) % suggestions.length
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const task = suggestions[activeIndex];
      if (task) selectTask(task);
    }
  };

  return (
    <div className="gap-2 rounded-md p-2 flex">
      <div className="relative flex-1">
        <Input
          value={line.taskTitle}
          variant="search"
          className="h-8 text-[13px]"
          placeholder="Search task or type a new task title"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={`timesheet-task-options-${line.id}`}
          aria-activedescendant={
            isOpen && suggestions[activeIndex]
              ? `timesheet-task-option-${line.id}-${suggestions[activeIndex].id}`
              : undefined
          }
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setIsOpen(false), 120);
          }}
          onChange={(event) => {
            onChange({
              ...line,
              taskTitle: event.target.value,
              selectedTask: null,
              taskStatus: "todo",
            });
            setIsOpen(true);
          }}
          onKeyDown={handleTaskKeyDown}
        />

        {isOpen && line.taskTitle.trim() ? (
          <div
            id={`timesheet-task-options-${line.id}`}
            className="absolute top-full z-20 mt-1 max-h-52 w-full overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
            role="listbox"
          >
            {suggestionsQuery.isLoading ? (
              <div className="space-y-1 p-1">
                <Skeleton className="h-7" />
                <Skeleton className="h-7" />
              </div>
            ) : suggestionsQuery.isError ? (
              <div className="px-2 py-2 text-[12px] text-muted-foreground">
                Failed to fetch tasks
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((task, index) => (
                <button
                  key={task.id}
                  id={`timesheet-task-option-${line.id}-${task.id}`}
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-sm px-2 py-1.5 text-left text-[12px] hover:bg-accent hover:text-accent-foreground",
                    index === activeIndex && "bg-accent text-accent-foreground"
                  )}
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectTask(task)}
                >
                  <span className="truncate">{task.title}</span>
                  <StatusBadge status={task.status} />
                </button>
              ))
            ) : (
              <div className="px-2 py-2 text-[12px] text-muted-foreground">
                No matching task found
              </div>
            )}
          </div>
        ) : null}

        {taskTitleSearch && !line.selectedTask ? (
          <p className="mt-1 truncate text-[11px] text-muted-foreground">
            Save will create {getStatusLabel(line.taskStatus)} task:{" "}
            <span className="font-medium">{taskTitleSearch}</span>
          </p>
        ) : null}
      </div>

      <Select
        value={line.taskStatus}
        onValueChange={(value) =>
          onChange({
            ...line,
            taskStatus: value as TimesheetTaskSuggestion["status"],
          })
        }
      >
        <SelectTrigger className="h-8 max-w-[8rem] text-[12px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todo">Todo</SelectItem>
          <SelectItem value="inprogress">In progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={line.hours}
        onValueChange={(value) =>
          onChange({
            ...line,
            hours: value,
            minutes: value === "24" ? "0" : line.minutes,
          })
        }
      >
        <SelectTrigger className="h-8 max-w-fit text-[12px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {HOUR_OPTIONS.map((option) => (
            <SelectItem key={option} value={String(option)}>
              {option}h
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={line.minutes}
        onValueChange={(value) => onChange({ ...line, minutes: value })}
        disabled={line.hours === "24"}
      >
        <SelectTrigger className="h-8 max-w-fit text-[12px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MINUTE_OPTIONS.map((option) => (
            <SelectItem key={option} value={String(option)}>
              {option}m
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={!canRemove}
          aria-label={`Remove task ${lineIndex + 1}`}
          onClick={onRemove}
        >
          <AppIcon name="Trash2" className="size-3.5" />
        </Button>
        {isLastLine ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            aria-label="Add task"
            onClick={onAdd}
          >
            <AppIcon name="Plus" className="size-3.5" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function ShortcutHint({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded border border-border bg-background px-1 text-[10px] font-medium text-foreground">
      {children}
    </span>
  );
}

function createInitialTaskLines(row: TimesheetSheetRow): TaskLineState[] {
  const entries = getDisplayEntries(row);

  if (entries.length === 0) return [createEmptyTaskLine()];

  return entries.map((entry) => ({
    id: createLineId(),
    taskTitle: entry.task?.title ?? "",
    selectedTask: entry.task,
    taskStatus: entry.task?.status ?? "todo",
    hours: String(entry.hours),
    minutes: String(entry.minutes),
  }));
}

function createEmptyTaskLine(): TaskLineState {
  return {
    id: createLineId(),
    taskTitle: "",
    selectedTask: null,
    taskStatus: "todo",
    hours: "0",
    minutes: "0",
  };
}

function createLineId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getDisplayEntries(row: TimesheetSheetRow) {
  if (row.entries?.length) return row.entries;

  if (!row.task || row.minutesSpent <= 0) return [];

  return [
    {
      entryId: row.entryId ?? 0,
      task: row.task,
      minutesSpent: row.minutesSpent,
      hours: row.hours,
      minutes: row.minutes,
      updatedAt: row.updatedAt,
    },
  ];
}

function normalizeTaskTitle(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function getStatusLabel(status: TimesheetTaskSuggestion["status"]) {
  if (status === "inprogress") return "in progress";
  if (status === "completed") return "completed";

  return "todo";
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

function LeaveBadge({ row }: { row: TimesheetSheetRow }) {
  if (!row.isLeave) return null;

  return (
    <Badge
      variant="outline"
      className={cn(
        "shrink-0 rounded-sm px-1.5 py-0 text-[10px] font-semibold",
        row.isWeekend
          ? "border-border bg-muted text-muted-foreground"
          : "border-destructive/30 bg-destructive/10 text-destructive"
      )}
    >
      {row.isWeekend ? "W-OFF" : "LEAVE"}
    </Badge>
  );
}

function VerificationBadge({ row }: { row: TimesheetSheetRow }) {
  if (!row.verification.isVerified) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
        <span className="size-1.5 rounded-full bg-muted-foreground/50" />
        Pending
      </span>
    );
  }

  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 text-[12px]"
      title={
        row.verification.verifier
          ? `Verified by ${row.verification.verifier.name}`
          : "Verified"
      }
    >
      <span className="size-1.5 rounded-full bg-success" />
      <span className="truncate">Verified</span>
    </span>
  );
}

function RoleBadge({ role }: { role: TimesheetSheetRow["user"]["role"] }) {
  if (!role) return null;

  const label =
    role === "manager" ? "Manager" : role === "lead" ? "Lead" : "Member";

  return (
    <Badge
      variant="outline"
      className="shrink-0 rounded-sm px-1.5 py-0 text-[10px]"
    >
      {label}
    </Badge>
  );
}

function formatSpentTime(minutesSpent: number) {
  if (minutesSpent <= 0) return "0m";

  const hours = Math.floor(minutesSpent / 60);
  const minutes = minutesSpent % 60;

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;

  return `${minutes}m`;
}

export { TimesheetSheetsTable };
