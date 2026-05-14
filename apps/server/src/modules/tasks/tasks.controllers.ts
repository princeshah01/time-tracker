import type { Request, Response } from "express";

import type { ValidatedRequest } from "@/shared/middlewares";
import { requireRouteUser } from "@/shared/session";
import { sendSuccess } from "@/shared/utils";
import { tasksService } from "./tasks.service";
import type {
  createTaskSchema,
  listTasksSchema,
  taskIdParamSchema,
  updateTaskSchema,
} from "./tasks.validation";

export class TasksController {
  async create(req: Request, res: Response) {
    const { body } = (req as ValidatedRequest<typeof createTaskSchema>)
      .validated;
    const user = requireRouteUser(req);
    const task = await tasksService.createTask(body, user.id);

    return sendSuccess({
      res,
      data: task,
      message: "Task created successfully",
      status: 201,
    });
  }

  async list(req: Request, res: Response) {
    const { query } = (req as ValidatedRequest<typeof listTasksSchema>)
      .validated;
    const user = requireRouteUser(req);
    const tasks = await tasksService.listTasks(query, user.id);

    return sendSuccess({
      res,
      data: tasks,
      message: "Tasks fetched successfully",
    });
  }

  async view(req: Request, res: Response) {
    const { params } = (req as ValidatedRequest<typeof taskIdParamSchema>)
      .validated;
    const user = requireRouteUser(req);
    const task = await tasksService.getTask(params.taskId, user.id);

    return sendSuccess({
      res,
      data: task,
      message: "Task fetched successfully",
    });
  }

  async update(req: Request, res: Response) {
    const { params, body } = (req as ValidatedRequest<typeof updateTaskSchema>)
      .validated;
    const user = requireRouteUser(req);
    const task = await tasksService.updateTask(params.taskId, body, user.id);

    return sendSuccess({
      res,
      data: task,
      message: "Task updated successfully",
    });
  }
}

export const tasksController = new TasksController();
