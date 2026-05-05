import { Router } from "express";

import { permissionKeys } from "@/shared/constants/role-permission";
import { requireAuth, requirePermission, validate } from "@/shared/middlewares";
import { rolesController } from "./roles.controllers";
import {
  createRoleSchema,
  disableRoleSchema,
  listRolePermissionsSchema,
  listRolesSchema,
  roleIdParamSchema,
  updateRoleSchema,
} from "./roles.validation";

const rolesRouter = Router();

rolesRouter.use(requireAuth);
// rolesRouter.use(requirePermission(permissionKeys.roleManage));

rolesRouter.get("/", validate(listRolesSchema), rolesController.list);
rolesRouter.get(
  "/permissions",
  validate(listRolePermissionsSchema),
  rolesController.listPermissions
);
rolesRouter.get("/:roleId", validate(roleIdParamSchema), rolesController.view);
rolesRouter.post("/", validate(createRoleSchema), rolesController.create);
rolesRouter.patch("/:roleId", validate(updateRoleSchema), rolesController.update);
rolesRouter.patch(
  "/:roleId/disable",
  validate(disableRoleSchema),
  rolesController.toggleStatus
);

export { rolesRouter };
