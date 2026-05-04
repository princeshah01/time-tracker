import { emailOTPClient, twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { env } from "../config";

type AuthClientError = { message?: string; code?: string } | null;
type AuthClientResult<TData = unknown> = Promise<{
  data?: TData;
  error?: AuthClientError;
}>;

type AuthClientExtraApi = {
  signUp: {
    email(input: {
      name: string;
      email: string;
      password: string;
    }): AuthClientResult;
  };

  signIn: {
    email(input: { email: string; password: string }): AuthClientResult;
  };
  changePassword(input: {
    currentPassword: string;
    newPassword: string;
    revokeOtherSessions?: boolean;
  }): AuthClientResult;

  emailOtp: {
    verifyEmail(input: { email: string; otp: string }): AuthClientResult;

    sendVerificationOtp(input: {
      email: string;
      type: "email-verification" | "sign-in" | "forget-password";
    }): AuthClientResult;
  };

  twoFactor: {
    enable(input: { password: string }): AuthClientResult<{
      totpURI?: string;
      backupCodes?: string[];
    }>;

    verifyTotp(input: {
      code: string;
      trustDevice?: boolean;
    }): AuthClientResult;

    disable(input: { password: string }): AuthClientResult;
  };
};

const authClient: ReturnType<typeof createAuthClient> & AuthClientExtraApi =
  createAuthClient({
    baseURL: env.VITE_API_BASE_URL,
    plugins: [emailOTPClient(), twoFactorClient()],
  }) as unknown as ReturnType<typeof createAuthClient> & AuthClientExtraApi;

export { authClient };
