export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export type InvitationRow = {
  id: string;
  email: string;
  roleName: string;
  status: InvitationStatus;
  createdAt: string;
  invitedBy: {
    name: string;
    email: string;
  };
};

export type InvitationRoleOption = {
  id: string;
  name: string;
};
