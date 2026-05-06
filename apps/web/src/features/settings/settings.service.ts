import { apiFetch } from "@/shared/lib";
import type {
  ListRolesResponse,
  RoleView,
  RolePermission,
  AssignableRoleResponse,
  InvitationStatus,
  ListInvitationsResponse,
  SendInvitationResponse,
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
  listAssignableRoles() {
    return apiFetch<AssignableRoleResponse>({
      method: "GET",
      url: "/roles/assignable",
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

  sendInvite(input: { email: string; roleId: number }) {
    return apiFetch<SendInvitationResponse>({
      method: "POST",
      url: "/invitations",
      data: input,
    });
  },

  listInvitations(input: {
    page: number;
    limit: number;
    q?: string;
    status?: InvitationStatus;
  }) {
    return apiFetch<ListInvitationsResponse>({
      method: "GET",
      url: "/invitations",
      params: {
        page: input.page,
        limit: input.limit,
        q: input.q ?? "",
        ...(input.status ? { status: input.status } : {}),
      },
    });
  },

  revokeInvitation(invitationId: number) {
    return apiFetch({
      method: "PATCH",
      url: `/invitations/${invitationId}/revoke`,
    });
  },
};
