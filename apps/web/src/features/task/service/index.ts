import { apiFetch } from "@/shared/lib";
import type {
  CreateTaskInput,
  ListTasksResponse,
  TaskDetail,
  TaskStatusFilter,
  UpdateTaskInput,
} from "../task.types";

export const taskService = {
  listTasks(input: {
    page: number;
    limit: number;
    q?: string;
    projectId?: number | null;
    status?: TaskStatusFilter;
  }) {
    return apiFetch<ListTasksResponse>({
      method: "GET",
      url: "/tasks",
      params: {
        page: input.page,
        limit: input.limit,
        q: input.q ?? "",
        ...(input.projectId ? { projectId: input.projectId } : {}),
        ...(input.status && input.status !== "all"
          ? { status: input.status }
          : {}),
      },
    });
  },

  viewTask(taskId: number) {
    return apiFetch<TaskDetail>({
      method: "GET",
      url: `/tasks/${taskId}`,
    });
  },

  createTask(input: CreateTaskInput) {
    return apiFetch<TaskDetail>({
      method: "POST",
      url: "/tasks",
      data: input,
    });
  },

  updateTask(taskId: number, input: UpdateTaskInput) {
    return apiFetch<TaskDetail>({
      method: "PATCH",
      url: `/tasks/${taskId}`,
      data: input,
    });
  },
};
