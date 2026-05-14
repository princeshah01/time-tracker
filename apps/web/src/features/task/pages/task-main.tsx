import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { toast } from "@workspace/ui/components/sonner";
import debounce from "lodash.debounce";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppSelector } from "@/app/store/hooks";
import { projectService } from "@/features/project";
import { AppIcon } from "@/shared/components/app-icon";
import { PageContent } from "@/shared/components/page-content";
import { RequirePermissions } from "@/shared/components/permission-wrapper";
import { permissions, QUERY_KEYS } from "@/shared/constants";
import { hasPermission } from "@/shared/lib";
import { TaskFilters, TaskTable } from "../_components";
import { taskService } from "../service";
import type { TaskListItem, TaskStatus, TaskStatusFilter } from "../task.types";

function TaskMainPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userPermissions = useAppSelector((state) => state.user.permissions);
  const canMutateTasks = hasPermission(userPermissions, [
    permissions.taskCreate,
  ]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [projectId, setProjectId] = useState<number | null>(null);
  const [status, setStatus] = useState<TaskStatusFilter>("all");
  const [rowLimit, setRowLimit] = useState(0);

  const debouncedFn = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value.trim());
      }, 500),
    []
  );

  useEffect(() => {
    debouncedFn(search);

    return () => {
      debouncedFn.cancel();
    };
  }, [search, debouncedFn]);

  const projectsQuery = useQuery({
    queryKey: [QUERY_KEYS.PROJECTS, "task-list-filter"],
    queryFn: async () => {
      const response = await projectService.listProjects({
        page: 1,
        limit: 100,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch projects");
      }

      return response.data.items;
    },
  });

  const tasksQuery = useInfiniteQuery({
    queryKey: [
      QUERY_KEYS.TASKS,
      debouncedSearch,
      projectId ?? "all",
      status,
      rowLimit,
    ],
    enabled: Boolean(rowLimit),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await taskService.listTasks({
        page: pageParam,
        limit: rowLimit,
        q: debouncedSearch,
        projectId,
        status,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch tasks");
      }

      return response.data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (input: { task: TaskListItem; status: TaskStatus }) => {
      const response = await taskService.updateTask(input.task.id, {
        status: input.status,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update task");
      }

      return response.data;
    },
    onSuccess: (task) => {
      toast.success("Task status updated successfully");
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TASK_DETAIL, task.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  function editTask(task: TaskListItem) {
    if (!canMutateTasks) return;
    navigate(`/tasks/${task.id}`);
  }

  return (
    <PageContent.Root className="h-full min-h-0">
      <PageContent.Header title="Tasks" className="sticky top-0 z-10" />
      <PageContent.Body className="min-h-0 overflow-y-auto">
        <div className="space-y-4 p-4">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
            <TaskFilters
              search={search}
              projectId={projectId}
              projects={projectsQuery.data ?? []}
              isProjectsLoading={projectsQuery.isLoading}
              status={status}
              onSearchChange={setSearch}
              onProjectChange={setProjectId}
              onStatusChange={setStatus}
            />

            <RequirePermissions requiredPermissions={[permissions.taskCreate]}>
              <Button
                size="sm"
                className="h-8 gap-1.5 text-[12px]"
                onClick={() => navigate("/tasks/new")}
              >
                <AppIcon name="Plus" className="size-3.5" />
                Add Task
              </Button>
            </RequirePermissions>
          </div>

          <TaskTable
            data={tasksQuery.data}
            isLoading={tasksQuery.isLoading}
            hasNextPage={tasksQuery.hasNextPage}
            isFetchingNextPage={tasksQuery.isFetchingNextPage}
            fetchNextPage={() => void tasksQuery.fetchNextPage()}
            setRowLimit={setRowLimit}
            canMutate={canMutateTasks}
            updatingTaskId={updateStatusMutation.variables?.task.id ?? null}
            updatingStatus={updateStatusMutation.isPending}
            onEdit={editTask}
            onStatusChange={(task, nextStatus) => {
              if (task.status === nextStatus) return;
              updateStatusMutation.mutate({ task, status: nextStatus });
            }}
          />
        </div>
      </PageContent.Body>
    </PageContent.Root>
  );
}

export default TaskMainPage;
