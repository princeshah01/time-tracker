export type SuggestedUser = {
  name: string;
  email: string;
  role: string | null;
  canSendInvite: boolean;
};

export type SearchRequester = {
  id: string;
  email: string;
};

export type OnboardedUserSearchRecord = {
  id: string;
  name: string;
  email: string;
  role: string | null;
};

export type InvitedUserSearchRecord = {
  id: number;
  email: string;
  role: string | null;
  acceptedAt: Date | null;
  revokedAt: Date | null;
  expiresAt: Date;
};
