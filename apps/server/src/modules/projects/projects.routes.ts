import { Router } from "express";

import { permissionKeys } from "@/shared/constants/role-permission";
import { requireAuth, requirePermission, validate } from "@/shared/middlewares";
import { projectsController } from "./projects.controllers";
import {
  createProjectSchema,
  listProjectsSchema,
  projectIdParamSchema,
  updateProjectBillingSchema,
  updateProjectSchema,
} from "./projects.validation";

const projectsRouter = Router();

projectsRouter.use(requireAuth);

projectsRouter.get(
  "/",
  requirePermission([
    permissionKeys.projectViewAll,
    permissionKeys.projectViewOwn,
  ]),
  validate(listProjectsSchema),
  projectsController.list
);

projectsRouter.post(
  "/",
  requirePermission(permissionKeys.projectCreate),
  validate(createProjectSchema),
  projectsController.create
);

projectsRouter.get(
  "/:projectId",
  requirePermission([
    permissionKeys.projectViewAll,
    permissionKeys.projectViewOwn,
  ]),
  validate(projectIdParamSchema),
  projectsController.view
);

projectsRouter.patch(
  "/:projectId/billing",
  requirePermission(permissionKeys.projectFinanceManagement),
  validate(updateProjectBillingSchema),
  projectsController.updateBilling
);

projectsRouter.patch(
  "/:projectId",
  requirePermission([
    permissionKeys.projectManageAll,
    permissionKeys.projectManageOwn,
  ]),
  validate(updateProjectSchema),
  projectsController.update
);

projectsRouter.patch(
  "/:projectId/disable",
  requirePermission([
    permissionKeys.projectManageAll,
    permissionKeys.projectManageOwn,
  ]),
  validate(projectIdParamSchema),
  projectsController.toggleStatus
);

export { projectsRouter };
