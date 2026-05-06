export type SuggestedUser = {
  id?: string;
  name: string;
  email: string;
  role: string | null;
  image?: string | null;
  skills?: string[];
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
  image: string | null;
};

export type InvitedUserSearchRecord = {
  id: number;
  email: string;
  role: string | null;
  acceptedAt: Date | null;
  revokedAt: Date | null;
  expiresAt: Date;
};

export type SkillUserSearchRecord = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  image: string | null;
  skill: string;
};
