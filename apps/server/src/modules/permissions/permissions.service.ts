import {
  DEFAULT_ROLE_NAME,
  type PermissionKey,
} from "@/shared/constants/auth.constants";
import { HttpError } from "@/shared/http/http-error";
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

  async checkPermission(userId: string, permission: PermissionKey | string) {
    const authorization = await this.getUserAuthorization(userId);
    return authorization.permissions.includes(permission);
  }

  async getRoleById(roleId: number) {
    return this.permissionsRepository.findRoleById(roleId);
  }

  async requirePermission(userId: string, permission: PermissionKey | string) {
    const hasPermission = await this.checkPermission(userId, permission);

    if (!hasPermission) {
      throw new HttpError(403, "Forbidden");
    }
  }

  async attachDefaultRole(userId: string) {
    const userRoles = await this.permissionsRepository.findUserRoles(userId);

    if (userRoles.length > 0) {
      return userRoles[0];
    }

    const defaultRole =
      (await this.permissionsRepository.findDefaultRole()) ??
      (await this.permissionsRepository.findRoleByName(DEFAULT_ROLE_NAME));

    if (!defaultRole) {
      throw new Error(`Default role '${DEFAULT_ROLE_NAME}' was not seeded`);
    }

    await this.permissionsRepository.insertUserRole(userId, defaultRole.id);
    return defaultRole;
  }

  async assignRoleToUser(userId: string, roleId: number, replace = true) {
    const role = await this.permissionsRepository.findRoleById(roleId);

    if (!role) {
      throw new HttpError(404, "Role not found");
    }

    if (replace) {
      await this.permissionsRepository.clearUserRoles(userId);
    }

    await this.permissionsRepository.insertUserRole(userId, role.id);
    return role;
  }
}

export const permissionsService = new PermissionsService();
