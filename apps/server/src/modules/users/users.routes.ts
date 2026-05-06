import { Router } from "express";

import { permissionKeys } from "@/shared/constants/role-permission";
import { requireAuth, requirePermission, validate } from "@/shared/middlewares";
import { usersController } from "./users.controllers";
import {
  listUsersSchema,
  searchUsersSchema,
  updateMySkillsSchema,
  updateUserSchema,
  userIdParamSchema,
} from "./users.validation";

const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.post(
  "/search",
  validate(searchUsersSchema),
  usersController.search
);
usersRouter.patch(
  "/me/skills",
  validate(updateMySkillsSchema),
  usersController.updateMySkills
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
  usersController.view
);
usersRouter.patch(
  "/:userId",
  // requirePermission(permissionKeys.userManage),
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
