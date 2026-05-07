export type RoleListItem = {
  id: number;
  name: string;
  description: string | null;
  level: number;
  isDefault: boolean;
  isActive: boolean;
  permissionsCount: number;
};

export type RolePermission = {
  name: string;
  include: boolean;
};

export type RoleView = {
  id: number;
  name: string;
  description: string | null;
  level: number;
  isDefault: boolean;
  isActive: boolean;
  permissions: RolePermission[];
};

export type ListRolesResponse = {
  items: RoleListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
};

export type AssignableRole = {
  value: number;
  label: string;
  level: number;
};

export type AssignableRoleResponse = {
  assignableRoles: AssignableRole[];
};

export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export type InvitationListItem = {
  id: number;
  email: string;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  role: {
    id: number;
    name: string;
    description: string | null;
  };
  invitedBy: {
    id: string | null;
    name: string | null;
    email: string | null;
    role: string | null;
  };
  status: InvitationStatus;
};

export type ListInvitationsResponse = {
  items: InvitationListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
};

export type SendInvitationResponse = {
  id: number;
  email: string;
  role: {
    id: number;
    name: string;
    description: string | null;
  };
  status: InvitationStatus;
  expiresAt: string;
  inviteUrl: string;
};
