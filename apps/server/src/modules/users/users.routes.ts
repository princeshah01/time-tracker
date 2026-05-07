import { Router } from "express";

import { requireAuth, validate } from "@/shared/middlewares";
import { usersController } from "./users.controllers";
import {
  listUsersSchema,
  searchUsersSchema,
  updateUserSchema,
  userIdParamSchema,
} from "./users.validation";
import { requirePermission } from "@/shared/middlewares";
import { permissionKeys } from "@/shared/constants/role-permission";

const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.post(
  "/search",
  validate(searchUsersSchema),
  usersController.search
);

usersRouter.get(
  "/",
  // requirePermission(permissionKeys.userManage),
  validate(listUsersSchema),
  usersController.list
);
usersRouter.get(
  "/:userId",
  // requirePermission(permissionKeys.userManage),
  validate(userIdParamSchema),
  // Simulate network delay
  usersController.view
);
usersRouter.patch(
  "/:userId",
  requirePermission(permissionKeys.userManage),
  validate(updateUserSchema),
  usersController.update
);
usersRouter.post(
  "/:userId/reset-password",
  // requirePermission(permissionKeys.userManage),
  validate(userIdParamSchema),
  usersController.sendPasswordReset
);

export { usersRouter };
