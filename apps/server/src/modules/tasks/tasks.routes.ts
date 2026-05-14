import { Router } from "express";

import { permissionKeys } from "@/shared/constants/role-permission";
import { requireAuth, requirePermission, validate } from "@/shared/middlewares";
import { tasksController } from "./tasks.controllers";
import {
  createTaskSchema,
  listTasksSchema,
  taskIdParamSchema,
  updateTaskSchema,
} from "./tasks.validation";

const tasksRouter = Router();

tasksRouter.use(requireAuth);

tasksRouter.get(
  "/",
  requirePermission([permissionKeys.taskViewAll, permissionKeys.taskViewOwn]),
  validate(listTasksSchema),
  tasksController.list
);

tasksRouter.post(
  "/",
  requirePermission(permissionKeys.taskCreate),
  validate(createTaskSchema),
  tasksController.create
);

tasksRouter.get(
  "/:taskId",
  requirePermission([permissionKeys.taskViewAll, permissionKeys.taskViewOwn]),
  validate(taskIdParamSchema),
  tasksController.view
);

tasksRouter.patch(
  "/:taskId",
  requirePermission(permissionKeys.taskCreate),
  validate(updateTaskSchema),
  tasksController.update
);

export { tasksRouter };
