import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useNavigate, useParams } from "react-router-dom";

import { AppIcon } from "@/shared/components/app-icon";
import { PageContent } from "@/shared/components/page-content";
import { QUERY_KEYS } from "@/shared/constants";
import { formatDate } from "@/shared/lib";
import { TimesheetSheetsTable } from "../_components";
import { timesheetService } from "../service";

function TimesheetSheetsPage() {
  const navigate = useNavigate();
  const params = useParams();
  const timesheetId = Number(params.timesheetId);

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
      >
        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-[12px]"
            onClick={() => navigate(`/timesheet/${timesheetId}`)}
          >
            <AppIcon name="Eye" className="size-3.5" />
            View / edit
          </Button>
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
        </div>
      </PageContent.Header>

      <PageContent.Body className="min-h-0 overflow-auto">
        {timesheetQuery.isLoading ? (
          <TimesheetSheetsSkeleton />
        ) : timesheetQuery.isError ? (
          <TimesheetSheetsError onRetry={() => void timesheetQuery.refetch()} />
        ) : timesheetQuery.data ? (
          <div className="space-y-3 p-4">
            <section className="rounded-md border border-border bg-card">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3">
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

              <div className="grid gap-px bg-border text-[12px] md:grid-cols-2">
                <div className="bg-background px-4 py-3">
                  <p className="text-[11px] text-muted-foreground">Start</p>
                  <p>{formatDate(timesheetQuery.data.startDate)}</p>
                </div>
                <div className="bg-background px-4 py-3">
                  <p className="text-[11px] text-muted-foreground">End</p>
                  <p>{formatDate(timesheetQuery.data.endDate)}</p>
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
