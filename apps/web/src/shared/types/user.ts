export type Gender = "male" | "female" | "other";

export type User = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  skills?: string[];
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  hasPassword?: boolean;
  hasMicrosoftAccount?: boolean;
  dob?: string | null;
  gender?: Gender | null;
};
