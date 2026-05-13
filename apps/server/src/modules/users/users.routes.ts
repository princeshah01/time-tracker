import { Router } from "express";

import { permissionKeys } from "@/shared/constants/role-permission";
import { requireAuth, requirePermission, validate } from "@/shared/middlewares";
import { usersController } from "./users.controllers";
import {
  createUserSalarySchema,
  listUsersSchema,
  searchUsersSchema,
  updateUserSalarySchema,
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
usersRouter.get(
  "/:userId/financial",
  requirePermission(permissionKeys.userManageFinancial),
  validate(userIdParamSchema),
  usersController.getFinancials
);
usersRouter.post(
  "/:userId/financial/salaries",
  requirePermission(permissionKeys.userManageFinancial),
  validate(createUserSalarySchema),
  usersController.createSalary
);
usersRouter.patch(
  "/:userId/financial/salaries/:salaryId",
  requirePermission(permissionKeys.userManageFinancial),
  validate(updateUserSalarySchema),
  usersController.updateSalary
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
