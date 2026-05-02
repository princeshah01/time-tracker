import type { RequestHandler } from "express";

import {
  type PermissionInput,
  permissionsService,
} from "@/modules/permissions/permissions.service";
import { AppError } from "@/shared/utils";

export function requirePermission(permissions: PermissionInput): RequestHandler {
  return async (req, _res, next) => {
    try {
      if (!req.user) {
        throw new AppError({
          message: "Please log in to access this resource.",
          code: "UNAUTHORIZED",
        });
      }

      await permissionsService.requirePermission(req.user.id, permissions);
      next();
    } catch (error) {
      next(error);
    }
  };
}
