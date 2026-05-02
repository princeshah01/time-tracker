export type CreateInviteInput = {
  email: string;
  roleId: number;
  invitedBy: string;
  invitedByName?: string;
};

export type CreatedInvite = {
  id: number;
  email: string;
  role: {
    id: number;
    name: string;
    description: string | null;
  };
  expiresAt: Date;
  inviteUrl: string;
};

export type InviteDetails = {
  email: string;
  role: {
    id: number;
    name: string;
    description: string | null;
  };
  expiresAt: Date;
};

export type AcceptInviteInput = {
  token: string;
  name: string;
  password: string;
};

export type AcceptedInvite = {
  email: string;
  accepted: true;
};
