import { AppError } from "@/shared/utils";
import { permissionsService } from "@/modules/permissions/permissions.service";
import { RolesRepository } from "./roles.repository";

type RolePermissionView = {
  name: string;
  include: boolean;
};

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

export class RolesService {
  constructor(private readonly rolesRepository = new RolesRepository()) {}

  async listRoles(
    input: { page: number; limit: number; q?: string },
    requesterId: string
  ) {
    const maxRoleLevel =
      await permissionsService.getUserMaxRoleLevel(requesterId);
    const result = await this.rolesRepository.listRolesPaginated({
      ...input,
      maxRoleLevel,
    });
    const roleIds = result.items.map((role) => role.id);
    const permissionCounts =
      await this.rolesRepository.listPermissionCountsByRoleIds(roleIds);
    const countByRoleId = new Map(
      permissionCounts.map((row) => [row.roleId, Number(row.count)])
    );

    return {
      items: result.items.map((role) => ({
        ...role,
        permissionsCount: countByRoleId.get(role.id) ?? 0,
      })),
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
      hasNextPage: result.page * result.limit < result.total,
    };
  }

  async listAssignableRoles(requesterId: string) {
    const maxRoleLevel =
      await permissionsService.getUserMaxRoleLevel(requesterId);
    const assignableRoles =
      await this.rolesRepository.listAssignableRoles(maxRoleLevel);

    return { assignableRoles };
  }

  async viewRole(roleId: number, requesterId: string) {
    const role = await this.rolesRepository.findRoleById(roleId);

    if (
      !role ||
      role.level > (await permissionsService.getUserMaxRoleLevel(requesterId))
    ) {
      throw new AppError({
        message: "Role not found",
        code: "NOT_FOUND",
      });
    }

    const permissions = await this.getRolePermissionsView(role.id);

    return {
      ...role,
      ...permissions,
    };
  }

  async listPermissions(roleId: number | undefined, requesterId: string) {
    if (!roleId) {
      return this.getRolePermissionsView();
    }

    const role = await this.rolesRepository.findRoleById(roleId);

    if (
      !role ||
      role.level > (await permissionsService.getUserMaxRoleLevel(requesterId))
    ) {
      throw new AppError({
        message: "Role not found",
        code: "NOT_FOUND",
      });
    }

    return this.getRolePermissionsView(roleId);
  }

  async createRole(
    input: {
      name: string;
      description?: string;
      level: number;
      permissions: string[];
    },
    requesterId: string
  ) {
    const maxRoleLevel =
      await permissionsService.getUserMaxRoleLevel(requesterId);

    if (input.level > maxRoleLevel) {
      throw new AppError({
        message: "Role level cannot be higher than your role level",
        code: "FORBIDDEN",
      });
    }

    const normalizedName = normalizeName(input.name);
    const existingRole =
      await this.rolesRepository.findActiveRoleByName(normalizedName);

    if (existingRole) {
      throw new AppError({
        message: "Role name already exists",
        code: "CONFLICT",
      });
    }

    const role = await this.rolesRepository.createRole({
      name: normalizedName,
      description: input.description?.trim() || null,
      level: input.level,
    });

    if (!role) {
      throw new AppError({
        message: "Failed to create role",
        code: "INTERNAL_SERVER_ERROR",
        isOperational: false,
      });
    }

    await this.setRolePermissions(role.id, input.permissions);
    return this.viewRole(role.id, requesterId);
  }

  async updateRole(
    roleId: number,
    input: {
      name?: string;
      description?: string | null;
      level?: number;
      permissions?: string[];
    },
    requesterId: string
  ) {
    const role = await this.rolesRepository.findRoleById(roleId);

    if (!role) {
      throw new AppError({
        message: "Role not found",
        code: "NOT_FOUND",
      });
    }

    const maxRoleLevel =
      await permissionsService.getUserMaxRoleLevel(requesterId);

    if (role.level > maxRoleLevel) {
      throw new AppError({
        message: "You cannot manage a role above your level",
        code: "FORBIDDEN",
      });
    }

    if (input.level !== undefined && input.level > maxRoleLevel) {
      throw new AppError({
        message: "Role level cannot be higher than your role level",
        code: "FORBIDDEN",
      });
    }

    if (role.isDefault) {
      throw new AppError({
        message: "Default role cannot be edited",
        code: "FORBIDDEN",
      });
    }

    if (input.name !== undefined) {
      const normalizedName = normalizeName(input.name);
      const existingRole = await this.rolesRepository.findActiveRoleByName(
        normalizedName,
        roleId
      );

      if (existingRole) {
        throw new AppError({
          message: "Role name already exists",
          code: "CONFLICT",
        });
      }
    }

    await this.rolesRepository.updateRole(roleId, {
      ...(input.name !== undefined ? { name: normalizeName(input.name) } : {}),
      ...(input.description !== undefined
        ? { description: input.description?.trim() || null }
        : {}),
      ...(input.level !== undefined ? { level: input.level } : {}),
    });

    if (input.permissions !== undefined) {
      await this.setRolePermissions(roleId, input.permissions);
    }

    return this.viewRole(roleId, requesterId);
  }

  async toggleRoleStatus(roleId: number, requesterId: string) {
    const role = await this.rolesRepository.findRoleById(roleId);

    if (!role) {
      throw new AppError({
        message: "Role not found",
        code: "NOT_FOUND",
      });
    }

    if (
      role.level > (await permissionsService.getUserMaxRoleLevel(requesterId))
    ) {
      throw new AppError({
        message: "You cannot manage a role above your level",
        code: "FORBIDDEN",
      });
    }

    if (role.isDefault) {
      throw new AppError({
        message: "Default role status cannot be changed",
        code: "FORBIDDEN",
      });
    }

    if (role.isActive) {
      const totalUsers = await this.rolesRepository.countUsersByRoleId(roleId);

      if (totalUsers > 0) {
        throw new AppError({
          message: "Role is assigned to users and cannot be disabled",
          code: "CONFLICT",
        });
      }
    }

    const updatedRole = await this.rolesRepository.updateRole(roleId, {
      isActive: !role.isActive,
    });

    if (!updatedRole) {
      throw new AppError({
        message: "Failed to update role status",
        code: "INTERNAL_SERVER_ERROR",
        isOperational: false,
      });
    }

    return updatedRole;
  }

  private async getRolePermissionsView(roleId?: number) {
    const [allPermissions, rolePermissionKeys] = await Promise.all([
      this.rolesRepository.listAllPermissions(),
      roleId ? this.rolesRepository.listRolePermissionKeys(roleId) : [],
    ]);

    const assigned = new Set(rolePermissionKeys);
    const permissions: RolePermissionView[] = allPermissions.map(
      (permission) => ({
        name: permission.key,
        include: assigned.has(permission.key),
      })
    );

    return { permissions };
  }

  private async setRolePermissions(roleId: number, permissionKeys: string[]) {
    const normalizedKeys = [
      ...new Set(permissionKeys.map((key) => key.trim())),
    ];
    const permissionRecords =
      await this.rolesRepository.findPermissionsByKeys(normalizedKeys);

    if (permissionRecords.length !== normalizedKeys.length) {
      const foundKeys = new Set(
        permissionRecords.map((permission) => permission.key)
      );
      const missingPermissions = normalizedKeys.filter(
        (key) => !foundKeys.has(key)
      );

      throw new AppError({
        message: `Invalid permission keys: ${missingPermissions.join(", ")}`,
        code: "BAD_REQUEST",
      });
    }

    await this.rolesRepository.replaceRolePermissions(
      roleId,
      permissionRecords.map((permission) => permission.id)
    );
  }
}

export const rolesService = new RolesService();
