import { apiFetch } from "@/shared/lib";
import type {
  ListRolesResponse,
  RoleView,
  RolePermission,
} from "./settings.type";

export const settingsService = {
  listRoles(input: { page: number; limit: number; q?: string }) {
    return apiFetch<ListRolesResponse>({
      method: "GET",
      url: "/roles",
      params: {
        page: input.page,
        limit: input.limit,
        q: input.q ?? "",
      },
    });
  },

  viewRole(roleId: number) {
    return apiFetch<RoleView>({
      method: "GET",
      url: `/roles/${roleId}`,
    });
  },

  listPermissions(roleId?: number) {
    return apiFetch<{ permissions: RolePermission[] }>({
      method: "GET",
      url: "/roles/permissions",
      params: roleId ? { roleId } : {},
    });
  },

  createRole(input: {
    name: string;
    description?: string;
    permissions: string[];
  }) {
    return apiFetch<RoleView>({
      method: "POST",
      url: "/roles",
      data: input,
    });
  },

  updateRole(
    roleId: number,
    input: {
      name?: string;
      description?: string | null;
      permissions?: string[];
    }
  ) {
    return apiFetch<RoleView>({
      method: "PATCH",
      url: `/roles/${roleId}`,
      data: input,
    });
  },

  toggleRoleStatus(roleId: number) {
    return apiFetch({
      method: "PATCH",
      url: `/roles/${roleId}/disable`,
    });
  },
};
