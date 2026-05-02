export type ProfileUserInfo = {
  id: string;
  email: string;
  name: string;
  image: string | null;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  hasPassword: boolean;
  hasMicrosoftAccount: boolean;
};

export type ProfileRole = {
  id: number;
  name: string;
  description: string | null;
};

export type ProfileMe = {
  userInfo: ProfileUserInfo;
  role: ProfileRole | null;
  permissions: string[];
};

export type UpdateProfileInput = {
  name?: string;
  image?: string | null;
};
