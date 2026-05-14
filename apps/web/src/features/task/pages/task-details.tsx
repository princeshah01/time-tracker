import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { toast } from "@workspace/ui/components/sonner";
import { useNavigate, useParams } from "react-router-dom";

import { useAppSelector } from "@/app/store/hooks";
import { AppIcon } from "@/shared/components/app-icon";
import { PageContent } from "@/shared/components/page-content";
import { permissions, QUERY_KEYS } from "@/shared/constants";
import { hasPermission } from "@/shared/lib";
import { TaskForm } from "../_components";
import { taskService } from "../service";
import type { CreateTaskInput, UpdateTaskInput } from "../task.types";

function TaskDetailsPage() {
  const navigate = useNavigate();
  const params = useParams();
  const queryClient = useQueryClient();
  const taskId = Number(params.taskId);
  const userPermissions = useAppSelector((state) => state.user.permissions);
  const canEditTask = hasPermission(userPermissions, [permissions.taskCreate]);

  const taskQuery = useQuery({
    queryKey: [QUERY_KEYS.TASK_DETAIL, taskId],
    enabled: Number.isFinite(taskId) && taskId > 0,
    queryFn: async () => {
      const response = await taskService.viewTask(taskId);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch task");
      }

      return response.data;
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (input: CreateTaskInput | UpdateTaskInput) => {
      const response = await taskService.updateTask(
        taskId,
        input as UpdateTaskInput
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update task");
      }

      return response.data;
    },
    onSuccess: (task) => {
      toast.success("Task updated successfully");
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TASK_DETAIL, task.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <PageContent.Root className="h-full min-h-0">
      <PageContent.Header title="Edit Task" className="sticky top-0 z-10">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-[12px]"
          onClick={() => navigate("/tasks")}
        >
          <AppIcon name="X" className="size-3.5" />
          Close
        </Button>
      </PageContent.Header>

      <PageContent.Body className="min-h-0 max-w-4xl overflow-y-auto border-r border-border">
        {taskQuery.isLoading ? (
          <TaskDetailsSkeleton />
        ) : taskQuery.isError ? (
          <TaskDetailsError onRetry={() => void taskQuery.refetch()} />
        ) : taskQuery.data ? (
          <section className="bg-background">
            <div className="border-b p-4">
              <h2 className="text-base font-semibold">
                {taskQuery.data.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {taskQuery.data.project.name}
              </p>
            </div>

            <TaskForm
              task={taskQuery.data}
              mode="edit"
              canSubmit={canEditTask}
              isSubmitting={updateTaskMutation.isPending}
              onCancel={() => navigate("/tasks")}
              onSubmit={(input) => updateTaskMutation.mutate(input)}
            />
          </section>
        ) : null}
      </PageContent.Body>
    </PageContent.Root>
  );
}

function TaskDetailsSkeleton() {
  return (
    <div className="space-y-0">
      <div className="border-b p-4">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="grid gap-4 p-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskDetailsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="m-4 rounded-md border border-destructive/30 bg-destructive/5 p-4">
      <div className="font-medium text-[13px] text-destructive">
        Failed to load task
      </div>
      <p className="mt-1 text-[12px] text-muted-foreground">
        The selected task could not be fetched. Try again.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3 h-8 text-[12px]"
        onClick={onRetry}
      >
        <AppIcon name="Loader" className="size-3.5" />
        Retry
      </Button>
    </div>
  );
}

export default TaskDetailsPage;
