export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export type CreateInvitationInput = {
  email: string;
  roleId: number;
  invitedBy: string;
  invitedByName?: string;
};

export type AcceptInvitationInput = {
  name: string;
  password: string;
  inviteId: number;
};

export type InvitationCookiePayload = {
  inviteId: number;
  email: string;
  purpose: "invite-accept";
};
