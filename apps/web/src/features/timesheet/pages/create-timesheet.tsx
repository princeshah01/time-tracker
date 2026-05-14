import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { toast } from "@workspace/ui/components/sonner";
import { useNavigate } from "react-router-dom";

import { AppIcon } from "@/shared/components/app-icon";
import { PageContent } from "@/shared/components/page-content";
import { QUERY_KEYS } from "@/shared/constants";
import { TimesheetForm } from "../_components";
import { timesheetService } from "../service";
import type {
  CreateTimesheetInput,
  UpdateTimesheetInput,
} from "../timesheet.types";

function CreateTimesheetPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createTimesheetMutation = useMutation({
    mutationFn: async (input: CreateTimesheetInput | UpdateTimesheetInput) => {
      const response = await timesheetService.createTimesheet(
        input as CreateTimesheetInput
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to create timesheet");
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success("Timesheet created successfully");
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TIMESHEETS] });
      navigate("/timesheet");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <PageContent.Root className="h-full min-h-0">
      <PageContent.Header
        title="Create Timesheet"
        className="sticky top-0 z-10"
      >
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
      </PageContent.Header>

      <PageContent.Body className="min-h-0 max-w-4xl border-r border-border overflow-y-auto">
        <TimesheetForm
          mode="create"
          isSubmitting={createTimesheetMutation.isPending}
          onCancel={() => navigate("/timesheet")}
          onSubmit={(input) => createTimesheetMutation.mutate(input)}
        />
      </PageContent.Body>
    </PageContent.Root>
  );
}

export default CreateTimesheetPage;
