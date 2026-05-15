import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { toast } from "@workspace/ui/components/sonner";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { useAppSelector } from "@/app/store";
import { AppIcon } from "@/shared/components/app-icon";
import { PageContent } from "@/shared/components/page-content";
import { permissions, QUERY_KEYS } from "@/shared/constants";
import { hasPermission } from "@/shared/lib";
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
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const timesheetId = Number(params.timesheetId);
  const [mode, setMode] = useState<DetailsMode>("view");
  const { permissions: userPermissions } = useAppSelector(
    (state) => state.user
  );
  const canEditTimesheet = hasPermission(userPermissions, [
    permissions.timesheetCreate,
  ]);

  useEffect(() => {
    setMode(
      searchParams.get("mode") === "edit" && canEditTimesheet ? "edit" : "view"
    );
  }, [canEditTimesheet, searchParams]);

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
      />

      <PageContent.Body className="min-h-0 max-w-4xl border-r border-border overflow-y-auto">
        {timesheetQuery.isLoading ? (
          <TimesheetDetailsSkeleton />
        ) : timesheetQuery.isError ? (
          <TimesheetDetailsError
            onRetry={() => void timesheetQuery.refetch()}
          />
        ) : timesheetQuery.data ? (
          <div className="flex flex-col pb-4">
            <div className="self-end p-2 flex gap-2">
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
              {mode === "view" && canEditTimesheet ? (
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
                      onSelect={() => setMode("edit")}
                    >
                      <AppIcon name="Pencil" className="size-3.5" />
                      Edit timesheet details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
