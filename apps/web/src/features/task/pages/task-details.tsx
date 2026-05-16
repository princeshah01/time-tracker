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
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { useAppSelector } from "@/app/store/hooks";
import { AppIcon } from "@/shared/components/app-icon";
import { PageContent } from "@/shared/components/page-content";
import { permissions, QUERY_KEYS } from "@/shared/constants";
import { formatDate, hasPermission } from "@/shared/lib";
import { TaskForm, TaskStatusBadge } from "../_components";
import { taskService } from "../service";
import type { CreateTaskInput, UpdateTaskInput } from "../task.types";

type TaskDetailsMode = "edit" | "view";
type TaskDetailsLocationState = {
  mode?: TaskDetailsMode;
} | null;

function TaskDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const queryClient = useQueryClient();
  const taskId = Number(params.taskId);
  const userPermissions = useAppSelector((state) => state.user.permissions);
  const canManageTask = hasPermission(userPermissions, [
    permissions.taskManageAll,
    permissions.taskManageOwn,
  ]);
  const locationState = location.state as TaskDetailsLocationState;
  const [mode, setMode] = useState<TaskDetailsMode>("view");

  useEffect(() => {
    if (locationState?.mode === "edit" && canManageTask) {
      setMode("edit");
      return;
    }

    setMode("view");
  }, [canManageTask, locationState?.mode, taskId]);

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
      setMode("view");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <PageContent.Root className="h-full min-h-0">
      <PageContent.Header title="Task Details" className="sticky top-0 z-10" />

      <PageContent.Body className="min-h-0 overflow-y-auto">
        <div className="min-h-full max-w-4xl border-border border-r border-b bg-background">
          {taskQuery.isLoading ? (
            <TaskDetailsSkeleton />
          ) : taskQuery.isError ? (
            <TaskDetailsError onRetry={() => void taskQuery.refetch()} />
          ) : taskQuery.data ? (
            <>
              <section className="border-b">
                <div className="flex flex-col gap-3 p-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2
                        className="truncate text-base font-semibold"
                        title={taskQuery.data.title}
                      >
                        {taskQuery.data.title}
                      </h2>
                      <TaskStatusBadge status={taskQuery.data.status} />
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {taskQuery.data.project.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border text-[12px] md:min-w-72">
                    <InfoTile label="Task ID" value={`#${taskQuery.data.id}`} />
                    <InfoTile
                      label="Created"
                      value={formatDate(taskQuery.data.createdAt)}
                    />
                    <InfoTile
                      label="Updated"
                      value={formatDate(taskQuery.data.updatedAt)}
                    />
                    <InfoTile
                      label="Owner"
                      value={taskQuery.data.creator.name}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 border-border border-t py-2 pr-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-[12px]"
                    onClick={() => navigate("/tasks")}
                  >
                    <AppIcon name="ChevronLeft" className="size-3.5" />
                    Back to list
                  </Button>
                  {mode === "view" && canManageTask ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Open task actions"
                        >
                          <AppIcon name="MoreHorizontal" className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          className="gap-2 text-[12px]"
                          onSelect={() => setMode("edit")}
                        >
                          <AppIcon name="Pencil" className="size-3.5" />
                          Edit task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>
              </section>

              <TaskForm
                task={taskQuery.data}
                mode={mode}
                canSubmit={canManageTask}
                isSubmitting={updateTaskMutation.isPending}
                onCancel={() => setMode("view")}
                onSubmit={(input) => updateTaskMutation.mutate(input)}
              />
            </>
          ) : null}
        </div>
      </PageContent.Body>
    </PageContent.Root>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 bg-background px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="truncate text-[13px] font-medium" title={value}>
        {value}
      </div>
    </div>
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
