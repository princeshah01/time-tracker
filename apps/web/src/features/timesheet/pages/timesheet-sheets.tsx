import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useNavigate, useParams } from "react-router-dom";

import { useAppSelector } from "@/app/store";
import { AppIcon } from "@/shared/components/app-icon";
import { PageContent } from "@/shared/components/page-content";
import { permissions, QUERY_KEYS } from "@/shared/constants";
import { formatDate, hasPermission } from "@/shared/lib";
import { TimesheetSheetsTable } from "../_components";
import { timesheetService } from "../service";

function TimesheetSheetsPage() {
  const navigate = useNavigate();
  const params = useParams();
  const timesheetId = Number(params.timesheetId);
  const { permissions: userPermissions } = useAppSelector(
    (state) => state.user
  );
  const canEditTimesheet = hasPermission(userPermissions, [
    permissions.timesheetCreate,
  ]);

  const timesheetQuery = useQuery({
    queryKey: [QUERY_KEYS.TIMESHEET_DETAIL, timesheetId],
    enabled: Number.isFinite(timesheetId) && timesheetId > 0,
    queryFn: async () => {
      const response = await timesheetService.viewTimesheet(timesheetId);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch timesheet");
      }

      return response.data;
    },
  });

  return (
    <PageContent.Root className="h-full min-h-0">
      <PageContent.Header
        title="Timesheet Sheets"
        className="sticky top-0 z-10"
      />

      <PageContent.Body className="min-h-0 overflow-auto">
        {timesheetQuery.isLoading ? (
          <TimesheetSheetsSkeleton />
        ) : timesheetQuery.isError ? (
          <TimesheetSheetsError onRetry={() => void timesheetQuery.refetch()} />
        ) : timesheetQuery.data ? (
          <div className="space-y-3 p-4">
            <section className="rounded-md border border-border bg-card">
              <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <h2
                    className="truncate text-[13px] font-medium"
                    title={timesheetQuery.data.timesheetName}
                  >
                    {timesheetQuery.data.timesheetName}
                  </h2>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    Timesheet #{timesheetQuery.data.id}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <AppIcon name="CalendarDays" className="size-3.5" />
                      {formatDate(timesheetQuery.data.startDate)} -{" "}
                      {formatDate(timesheetQuery.data.endDate)}
                    </span>
                    <span>
                      {countDays(
                        timesheetQuery.data.startDate,
                        timesheetQuery.data.endDate
                      )}{" "}
                      total days
                    </span>
                    <span>
                      {countWorkingDays(
                        timesheetQuery.data.startDate,
                        timesheetQuery.data.endDate
                      )}{" "}
                      working days
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-[12px]"
                      onClick={() => navigate("/timesheet")}
                    >
                      <AppIcon name="ChevronLeft" className="size-3.5" />
                      Back
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Open timesheet actions"
                        >
                          <AppIcon name="MoreHorizontal" className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem
                          className="gap-2 text-[12px]"
                          disabled={!canEditTimesheet}
                          onSelect={() =>
                            navigate(`/timesheet/${timesheetId}?mode=edit`)
                          }
                        >
                          <AppIcon name="Pencil" className="size-3.5" />
                          Edit timesheet details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-[12px]"
                          onSelect={() => navigate(`/timesheet/${timesheetId}`)}
                        >
                          <AppIcon name="Eye" className="size-3.5" />
                          View timesheet details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <AppIcon name="FolderKanban" className="size-3.5" />
                      {timesheetQuery.data.project.name}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <AppIcon name="Users" className="size-3.5" />
                      {timesheetQuery.data.userCount} users
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <TimesheetSheetsTable timesheetId={timesheetId} />
          </div>
        ) : null}
      </PageContent.Body>
    </PageContent.Root>
  );
}

function countDays(startDate: string, endDate: string) {
  const start = toUtcDate(startDate);
  const end = toUtcDate(endDate);
  const diff = end.getTime() - start.getTime();

  if (diff < 0) return 0;

  return Math.floor(diff / 86_400_000) + 1;
}

function countWorkingDays(startDate: string, endDate: string) {
  const totalDays = countDays(startDate, endDate);
  const start = toUtcDate(startDate);
  let workingDays = 0;

  for (let index = 0; index < totalDays; index += 1) {
    const date = new Date(start.getTime() + index * 86_400_000);
    const day = date.getUTCDay();

    if (day !== 0 && day !== 6) workingDays += 1;
  }

  return workingDays;
}

function toUtcDate(value: string) {
  const date = new Date(value);

  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

function TimesheetSheetsSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="h-28" />
      <Skeleton className="h-72" />
    </div>
  );
}

function TimesheetSheetsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
      <div>
        <h2 className="text-[13px] font-medium">Failed to load sheets</h2>
        <p className="text-[12px] text-muted-foreground">
          The selected timesheet could not be fetched.
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

export default TimesheetSheetsPage;
