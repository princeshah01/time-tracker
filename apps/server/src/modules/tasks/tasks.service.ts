import { permissionsService } from "@/modules/permissions/permissions.service";
import { permissionKeys } from "@/shared/constants/role-permission";
import type { AccessScope } from "@/shared/types";
import { AppError } from "@/shared/utils";
import { TasksRepository } from "./tasks.repository";
import type {
  CreateTaskInput,
  ListTasksInput,
  UpdateTaskInput,
} from "./tasks.validation";

type TaskRecord = NonNullable<
  Awaited<ReturnType<TasksRepository["findTaskById"]>>
>;

export class TasksService {
  constructor(private readonly tasksRepository = new TasksRepository()) {}

  async createTask(input: CreateTaskInput, requesterId: string) {
    await this.requireProjectMembership(input.projectId, requesterId);

    const task = await this.tasksRepository.createTask({
      ...input,
      title: input.title.trim(),
      description: input.description ?? null,
      createdBy: requesterId,
    });

    if (!task) {
      throw new AppError({
        message: "Failed to create task",
        code: "INTERNAL_SERVER_ERROR",
        isOperational: false,
      });
    }

    return this.getTask(task.id, requesterId);
  }

  async listTasks(input: ListTasksInput, requesterId: string) {
    const scope = await this.resolveViewScope(requesterId);
    const result = await this.tasksRepository.listTasksPaginated({
      ...input,
      requesterId,
      scope,
    });

    return {
      items: result.items,
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
      hasNextPage: result.page * result.limit < result.total,
    };
  }

  async getTask(taskId: number, requesterId: string) {
    const scope = await this.resolveViewScope(requesterId);

    return this.requireTaskAccess(taskId, requesterId, scope);
  }

  async updateTask(
    taskId: number,
    input: UpdateTaskInput,
    requesterId: string
  ) {
    const task = await this.requireExistingTask(taskId);
    await this.requireProjectMembership(task.projectId, requesterId);

    await this.tasksRepository.updateTask(taskId, {
      ...input,
      title: input.title?.trim(),
      ...(input.description !== undefined
        ? { description: input.description ?? null }
        : {}),
    });

    return this.getTask(taskId, requesterId);
  }

  private async requireProjectMembership(
    projectId: number,
    requesterId: string
  ) {
    const project = await this.tasksRepository.findProjectById(projectId);

    if (!project) {
      throw new AppError({
        message: "Project not found",
        code: "NOT_FOUND",
      });
    }

    if (
      await this.tasksRepository.hasProjectMembership(projectId, requesterId)
    ) {
      return project;
    }

    throw new AppError({
      message: "Only project team members can create tasks",
      code: "FORBIDDEN",
    });
  }

  private async requireTaskAccess(
    taskId: number,
    requesterId: string,
    scope: AccessScope
  ): Promise<TaskRecord> {
    const task = await this.tasksRepository.findTaskById(taskId);

    if (!task) {
      throw new AppError({
        message: "Task not found",
        code: "NOT_FOUND",
      });
    }

    if (scope === "all") return task;

    const hasOwnAccess =
      task.project.createdBy === requesterId ||
      (await this.tasksRepository.hasProjectMembership(
        task.projectId,
        requesterId
      ));

    if (!hasOwnAccess) {
      throw new AppError({
        message: "Task not found",
        code: "NOT_FOUND",
      });
    }

    return task;
  }

  private async requireExistingTask(taskId: number) {
    const task = await this.tasksRepository.findTaskById(taskId);

    if (!task) {
      throw new AppError({
        message: "Task not found",
        code: "NOT_FOUND",
      });
    }

    return task;
  }

  private resolveViewScope(userId: string) {
    return permissionsService.requireAccessScope(userId, {
      all: permissionKeys.taskViewAll,
      own: permissionKeys.taskViewOwn,
    });
  }
}

export const tasksService = new TasksService();
