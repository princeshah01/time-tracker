import { Router } from "express";

import { requireAuth, validate, requirePermission } from "@/shared/middlewares";
import { rolesController } from "./roles.controllers";
import {
  createRoleSchema,
  disableRoleSchema,
  listRolePermissionsSchema,
  listRolesSchema,
  roleIdParamSchema,
  updateRoleSchema,
} from "./roles.validation";
import { permissionKeys } from "@/shared/constants/role-permission";

const rolesRouter = Router();

rolesRouter.use(requireAuth);

rolesRouter.get("/", 
  requirePermission(permissionKeys.roleView),
  validate(listRolesSchema), 
  rolesController.list);

// TODO: need to have based on Role Level,  
rolesRouter.get("/assignable", rolesController.listAssignable);

rolesRouter.get(
  "/permissions",
  requirePermission(permissionKeys.roleManage),
  validate(listRolePermissionsSchema),
  rolesController.listPermissions
);

rolesRouter.get("/:roleId", 
  requirePermission(permissionKeys.roleView),
  validate(roleIdParamSchema), 
  rolesController.view);

rolesRouter.post("/", 
  requirePermission(permissionKeys.roleManage),
  validate(createRoleSchema), 
  rolesController.create);
  
rolesRouter.patch(
  "/:roleId",
  requirePermission(permissionKeys.roleManage),
  validate(updateRoleSchema),
  rolesController.update
);
rolesRouter.patch(
  "/:roleId/disable",
  requirePermission(permissionKeys.roleManage),
  validate(disableRoleSchema),
  rolesController.toggleStatus
);

export { rolesRouter };
