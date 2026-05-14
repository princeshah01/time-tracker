import type { InfiniteData } from "@tanstack/react-query";
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
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { AppIcon } from "@/shared/components/app-icon";
import { formatDate } from "@/shared/lib";
import type {
  ListTimesheetsResponse,
  TimesheetListItem,
} from "../timesheet.types";

const CARD_WIDTH = 280;
const CARD_HEIGHT = 176;
const CARD_GAP = 12;
const ROW_BUFFER = 2;

type TimesheetCardGridProps = {
  data?: InfiniteData<ListTimesheetsResponse>;
  isLoading: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  setPageLimit: (limit: number) => void;
  onView?: (timesheet: TimesheetListItem) => void;
  onOpenSheets?: (timesheet: TimesheetListItem) => void;
};

function TimesheetCard({
  timesheet,
  onView,
  onOpenSheets,
}: {
  timesheet: TimesheetListItem;
  onView?: (timesheet: TimesheetListItem) => void;
  onOpenSheets?: (timesheet: TimesheetListItem) => void;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="flex h-44 w-[min(280px,100%)] shrink-0 flex-col justify-between rounded-md border border-border bg-card p-3 text-card-foreground hover:bg-muted/30">
          <div className="min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2
                  className="truncate text-[13px] font-medium"
                  title={timesheet.timesheetName}
                >
                  {timesheet.timesheetName}
                </h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Timesheet #{timesheet.id}
                </p>
              </div>
              <TimesheetCardActions
                timesheet={timesheet}
                onOpenSheets={onOpenSheets}
                onView={onView}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <AppIcon name="FolderKanban" className="size-3.5" />
                <span className="truncate" title={timesheet.project.name}>
                  {timesheet.project.name}
                </span>
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border text-[12px]">
            <div className="bg-background px-2 py-1.5">
              <dt className="text-[11px] text-muted-foreground">Start</dt>
              <dd className="truncate">{formatDate(timesheet.startDate)}</dd>
            </div>
            <div className="bg-background px-2 py-1.5">
              <dt className="text-[11px] text-muted-foreground">End</dt>
              <dd className="truncate">{formatDate(timesheet.endDate)}</dd>
            </div>
          </dl>

          <div className="flex items-center justify-between gap-3 text-[12px]">
            <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
              <AppIcon name="Users" className="size-3.5" />
              <span className="truncate">{timesheet.userCount} users</span>
            </div>
            <time className="text-[11px] text-muted-foreground">
              {formatDate(timesheet.createdAt)}
            </time>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-40">
        <TimesheetCardContextItems
          timesheet={timesheet}
          onOpenSheets={onOpenSheets}
          onView={onView}
        />
      </ContextMenuContent>
    </ContextMenu>
  );
}

function TimesheetCardActions({
  timesheet,
  onView,
  onOpenSheets,
}: {
  timesheet: TimesheetListItem;
  onView?: (timesheet: TimesheetListItem) => void;
  onOpenSheets?: (timesheet: TimesheetListItem) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="-mr-1 -mt-1 size-7 shrink-0"
          aria-label="Open timesheet actions"
        >
          <AppIcon name="MoreHorizontal" className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          className="gap-2 text-[12px]"
          onSelect={() => onOpenSheets?.(timesheet)}
        >
          <AppIcon name="FileSpreadsheet" className="size-3.5" />
          Open sheets
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 text-[12px]"
          onSelect={() => onView?.(timesheet)}
        >
          <AppIcon name="Eye" className="size-3.5" />
          View / edit
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TimesheetCardContextItems({
  timesheet,
  onView,
  onOpenSheets,
}: {
  timesheet: TimesheetListItem;
  onView?: (timesheet: TimesheetListItem) => void;
  onOpenSheets?: (timesheet: TimesheetListItem) => void;
}) {
  return (
    <>
      <ContextMenuItem
        className="gap-2 text-[12px]"
        onSelect={() => onOpenSheets?.(timesheet)}
      >
        <AppIcon name="FileSpreadsheet" className="size-3.5" />
        Open sheets
      </ContextMenuItem>
      <ContextMenuItem
        className="gap-2 text-[12px]"
        onSelect={() => onView?.(timesheet)}
      >
        <AppIcon name="Eye" className="size-3.5" />
        View / edit
      </ContextMenuItem>
    </>
  );
}

function TimesheetCardSkeleton() {
  return (
    <div className="flex h-44 w-[min(280px,100%)] shrink-0 flex-col justify-between rounded-md border border-border bg-card p-3">
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-2 gap-1">
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </div>
      <Skeleton className="h-4 w-28" />
    </div>
  );
}

function TimesheetCardGrid({
  data,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  setPageLimit,
  onView,
  onOpenSheets,
}: TimesheetCardGridProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastLimitRef = useRef<number | null>(null);
  const timesheets = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const calculateLimit = () => {
      const columns = Math.max(
        1,
        Math.floor((el.clientWidth + CARD_GAP) / (CARD_WIDTH + CARD_GAP))
      );
      const visibleRows = Math.max(
        1,
        Math.ceil((el.clientHeight + CARD_GAP) / (CARD_HEIGHT + CARD_GAP))
      );
      const nextLimit = columns * (visibleRows + ROW_BUFFER);

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
  }, [setPageLimit]);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const el = event.currentTarget;
      const isNearBottom =
        el.scrollTop + el.clientHeight >= el.scrollHeight - CARD_HEIGHT;

      if (isNearBottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  const showEmpty = !isLoading && timesheets.length === 0;
  const skeletonCount = lastLimitRef.current ?? 8;

  return (
    <div
      ref={containerRef}
      className="relative h-[calc(100vh-145px)] overflow-auto rounded-md border border-border bg-muted/20 p-3"
      onScroll={handleScroll}
    >
      <div className="flex flex-wrap content-start gap-3">
        {isLoading
          ? Array.from({ length: skeletonCount }).map((_, index) => (
              <TimesheetCardSkeleton key={index} />
            ))
          : timesheets.map((timesheet) => (
              <TimesheetCard
                key={timesheet.id}
                timesheet={timesheet}
                onOpenSheets={onOpenSheets}
                onView={onView}
              />
            ))}

        {isFetchingNextPage && !isLoading
          ? Array.from({ length: Math.min(skeletonCount, 6) }).map(
              (_, index) => <TimesheetCardSkeleton key={`next-${index}`} />
            )
          : null}
      </div>

      {showEmpty ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-muted-foreground text-sm">
          <AppIcon name="Inbox" className="mb-1 size-10" />
          No timesheets found
        </div>
      ) : null}
    </div>
  );
}

export { TimesheetCardGrid };
