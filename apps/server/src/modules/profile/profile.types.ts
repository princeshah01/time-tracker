export type ProfileUserInfo = {
  id: string;
  email: string;
  name: string;
  image: string | null;
  skills: string[];
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  hasPassword: boolean;
  hasMicrosoftAccount: boolean;
};

export type ProfileRole = {
  id: number;
  name: string;
  description: string | null;
  level: number;
};

export type ProfileMe = {
  user: ProfileUserInfo;
  role: ProfileRole | null;
  permissions: string[];
};

export type UpdateProfileInput = {
  name?: string;
  image?: string | null;
  skills?: string[];
};
