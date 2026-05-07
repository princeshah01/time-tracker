import type { Request, Response } from "express";

import type { ValidatedRequest } from "@/shared/middlewares";
import { requireRouteUser } from "@/shared/session";
import { sendSuccess } from "@/shared/utils";
import { rolesService } from "./roles.service";
import type {
  createRoleSchema,
  disableRoleSchema,
  listRolePermissionsSchema,
  listRolesSchema,
  roleIdParamSchema,
  updateRoleSchema,
} from "./roles.validation";

export class RolesController {
  async list(req: Request, res: Response) {
    const { query } = (req as ValidatedRequest<typeof listRolesSchema>)
      .validated;
    const user = requireRouteUser(req);
    const roles = await rolesService.listRoles(query, user.id);

    return sendSuccess({
      res,
      data: roles,
      message: "Roles fetched successfully",
    });
  }

  async listAssignable(req: Request, res: Response) {
    const user = requireRouteUser(req);
    const assignableRoles = await rolesService.listAssignableRoles(user.id);

    return sendSuccess({
      res,
      data: assignableRoles,
      message: "Assignable roles fetched successfully",
    });
  }

  async view(req: Request, res: Response) {
    const { params } = (req as ValidatedRequest<typeof roleIdParamSchema>)
      .validated;
    const user = requireRouteUser(req);
    const role = await rolesService.viewRole(params.roleId, user.id);
    return sendSuccess({
      res,
      data: role,
      message: "Role fetched successfully",
    });
  }

  async listPermissions(req: Request, res: Response) {
    const { query } = (
      req as ValidatedRequest<typeof listRolePermissionsSchema>
    ).validated;
    const user = requireRouteUser(req);
    const permissions = await rolesService.listPermissions(
      query.roleId,
      user.id
    );

    return sendSuccess({
      res,
      data: permissions,
      message: "Permissions fetched successfully",
    });
  }

  async create(req: Request, res: Response) {
    const { body } = (req as ValidatedRequest<typeof createRoleSchema>)
      .validated;
    const user = requireRouteUser(req);
    const role = await rolesService.createRole(body, user.id);

    return sendSuccess({
      res,
      data: role,
      message: "Role created successfully",
      status: 201,
    });
  }

  async update(req: Request, res: Response) {
    const { params, body } = (req as ValidatedRequest<typeof updateRoleSchema>)
      .validated;
    const user = requireRouteUser(req);
    const role = await rolesService.updateRole(params.roleId, body, user.id);

    return sendSuccess({
      res,
      data: role,
      message: "Role updated successfully",
    });
  }

  async toggleStatus(req: Request, res: Response) {
    const { params } = (req as ValidatedRequest<typeof disableRoleSchema>)
      .validated;
    const user = requireRouteUser(req);
    const role = await rolesService.toggleRoleStatus(params.roleId, user.id);

    return sendSuccess({
      res,
      data: role,
      message: role.isActive
        ? "Role activated successfully"
        : "Role disabled successfully",
    });
  }
}

export const rolesController = new RolesController();
