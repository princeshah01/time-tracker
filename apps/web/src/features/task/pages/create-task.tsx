import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { toast } from "@workspace/ui/components/sonner";
import { useNavigate } from "react-router-dom";

import { useAppSelector } from "@/app/store/hooks";
import { AppIcon } from "@/shared/components/app-icon";
import { PageContent } from "@/shared/components/page-content";
import { permissions, QUERY_KEYS } from "@/shared/constants";
import { hasPermission } from "@/shared/lib";
import { TaskForm } from "../_components";
import { taskService } from "../service";
import type { CreateTaskInput, UpdateTaskInput } from "../task.types";

function CreateTaskPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userPermissions = useAppSelector((state) => state.user.permissions);
  const canCreateTask = hasPermission(userPermissions, [
    permissions.taskCreate,
  ]);

  const createTaskMutation = useMutation({
    mutationFn: async (input: CreateTaskInput | UpdateTaskInput) => {
      const response = await taskService.createTask(input as CreateTaskInput);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to create task");
      }

      return response.data;
    },
    onSuccess: (task) => {
      toast.success("Task created successfully");
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROJECTS] });
      navigate(`/tasks/${task.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <PageContent.Root className="h-full min-h-0">
      <PageContent.Header title="Create Task" className="sticky top-0 z-10">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-[12px]"
          onClick={() => navigate("/tasks")}
        >
          <AppIcon name="X" className="size-3.5" />
          Cancel
        </Button>
      </PageContent.Header>

      <PageContent.Body className="min-h-0 max-w-4xl overflow-y-auto border-r border-border">
        <section className="bg-background">
          <div className="border-b p-4">
            <h2 className="text-base font-semibold">Task details</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a task for a project where you are assigned.
            </p>
          </div>

          <TaskForm
            mode="create"
            canSubmit={canCreateTask}
            isSubmitting={createTaskMutation.isPending}
            onCancel={() => navigate("/tasks")}
            onSubmit={(input) => createTaskMutation.mutate(input)}
          />
        </section>
      </PageContent.Body>
    </PageContent.Root>
  );
}

export default CreateTaskPage;
