import {
  defaultRoleName,
  type PermissionKey,
} from "@/shared/constants/role-permission";
import { AppError } from "@/shared/utils";
import { PermissionsRepository } from "./permissions.repository";

export type UserRole = {
  id: number;
  name: string;
  description: string | null;
};

export type UserAuthorization = {
  role: UserRole | null;
  permissions: string[];
};

export type PermissionInput =
  | PermissionKey
  | string
  | readonly (PermissionKey | string)[];

export class PermissionsService {
  constructor(
    private readonly permissionsRepository = new PermissionsRepository()
  ) {}

  async getUserAuthorization(userId: string): Promise<UserAuthorization> {
    const roles = await this.permissionsRepository.findUserRoles(userId);
    const primaryRole = roles[0] ?? null;
    const permissions =
      await this.permissionsRepository.findPermissionsForRoleIds(
        roles.map((role) => role.id)
      );

    return {
      role: primaryRole
        ? {
            id: primaryRole.id,
            name: primaryRole.name,
            description: primaryRole.description,
          }
        : null,
      permissions: [
        ...new Set(permissions.map((permission) => permission.key)),
      ],
    };
  }

  async checkPermission(userId: string, permissions: PermissionInput) {
    const authorization = await this.getUserAuthorization(userId);
    const requiredPermissions = Array.isArray(permissions)
      ? permissions
      : [permissions];

    return requiredPermissions.some((requiredPermission) =>
      authorization.permissions.includes(requiredPermission)
    );
  }

  async getRoleById(roleId: number) {
    return this.permissionsRepository.findRoleById(roleId);
  }

  async requirePermission(userId: string, permissions: PermissionInput) {
    const hasPermission = await this.checkPermission(userId, permissions);

    if (!hasPermission) {
      throw new AppError({
        message: "You do not have permission to access this resource.",
        code: "FORBIDDEN",
      });
    }
  }

  async attachDefaultRole(userId: string) {
    const userRoles = await this.permissionsRepository.findUserRoles(userId);

    if (userRoles.length > 0) {
      return userRoles[0];
    }

    const defaultRole =
      (await this.permissionsRepository.findDefaultRole()) ??
      (await this.permissionsRepository.findRoleByName(defaultRoleName));

    if (!defaultRole) {
      throw new AppError({
        message: `Default role '${defaultRoleName}' was not seeded`,
        code: "INTERNAL_SERVER_ERROR",
        isOperational: false,
      });
    }

    await this.permissionsRepository.insertUserRole(userId, defaultRole.id);
    return defaultRole;
  }

  async assignRoleToUser(userId: string, roleId: number, replace = true) {
    const role = await this.permissionsRepository.findRoleById(roleId);

    if (!role) {
      throw new AppError({
        message: "Role not found",
        code: "NOT_FOUND",
      });
    }

    if (replace) {
      await this.permissionsRepository.clearUserRoles(userId);
    }

    await this.permissionsRepository.insertUserRole(userId, role.id);
    return role;
  }
}

export const permissionsService = new PermissionsService();
