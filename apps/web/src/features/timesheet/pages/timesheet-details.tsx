import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { toast } from "@workspace/ui/components/sonner";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AppIcon } from "@/shared/components/app-icon";
import { PageContent } from "@/shared/components/page-content";
import { RequirePermissions } from "@/shared/components/permission-wrapper";
import { permissions, QUERY_KEYS } from "@/shared/constants";
import { TimesheetForm } from "../_components";
import { timesheetService } from "../service";
import type {
  CreateTimesheetInput,
  UpdateTimesheetInput,
} from "../timesheet.types";

type DetailsMode = "view" | "edit";

function TimesheetDetailsPage() {
  const navigate = useNavigate();
  const params = useParams();
  const queryClient = useQueryClient();
  const timesheetId = Number(params.timesheetId);
  const [mode, setMode] = useState<DetailsMode>("view");

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

  const updateTimesheetMutation = useMutation({
    mutationFn: async (input: CreateTimesheetInput | UpdateTimesheetInput) => {
      const response = await timesheetService.updateTimesheet(
        timesheetId,
        input as UpdateTimesheetInput
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update timesheet");
      }

      return response.data;
    },
    onSuccess: (timesheet) => {
      toast.success("Timesheet updated successfully");
      setMode("view");
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TIMESHEETS] });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TIMESHEET_DETAIL, timesheet.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <PageContent.Root className="h-full min-h-0">
      <PageContent.Header
        title={mode === "edit" ? "Edit Timesheet" : "Timesheet Details"}
        className="sticky top-0 z-10"
      >
      </PageContent.Header>

      <PageContent.Body className="min-h-0 max-w-4xl border-r border-border overflow-y-auto">
        {timesheetQuery.isLoading ? (
          <TimesheetDetailsSkeleton />
        ) : timesheetQuery.isError ? (
          <TimesheetDetailsError
            onRetry={() => void timesheetQuery.refetch()}
          />
        ) : timesheetQuery.data ? (
          <div className="flex flex-col py-4">
            <div className="flex items-center justify-between self-end  px-4 pb-4">
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
        {mode === "view" ? (
          <RequirePermissions
            requiredPermissions={[permissions.timesheetCreate]}
          >
            <Button
              type="button"
              size="sm"
              className="h-8 gap-1.5 text-[12px]"
              onClick={() => setMode("edit")}
            >
              <AppIcon name="Pencil" className="size-3.5" />
              Edit
            </Button>
          </RequirePermissions>
        ) : null}

        </div>
          <TimesheetForm
            key={`${timesheetQuery.data.id}-${mode}`}
            timesheet={timesheetQuery.data}
            mode={mode}
            isSubmitting={updateTimesheetMutation.isPending}
            onCancel={() => setMode("view")}
            onSubmit={(input) => updateTimesheetMutation.mutate(input)}
            />
          </div>
        ) : null}
      </PageContent.Body>
    </PageContent.Root>
  );
}

function TimesheetDetailsSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}

function TimesheetDetailsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
      <div>
        <h2 className="text-[13px] font-medium">Failed to load timesheet</h2>
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

export default TimesheetDetailsPage;
