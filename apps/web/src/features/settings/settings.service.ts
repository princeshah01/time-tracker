import { apiFetch } from "@/shared/lib";

type RoleListItem = {
  id: number;
  name: string;
  description: string | null;
  isDefault: boolean;
  isActive: boolean;
  permissionsCount: number;
};

type RolePermission = {
  name: string;
  include: boolean;
};

type RoleView = {
  id: number;
  name: string;
  description: string | null;
  isDefault: boolean;
  isActive: boolean;
  permissions: {
    permissions: RolePermission[];
  };
};

type ListRolesResponse = {
  items: RoleListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
};

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
