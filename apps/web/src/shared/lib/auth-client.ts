import { emailOTPClient, twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { env } from "../config";

type AuthClientExtraApi = {
  signUp: {
    email(input: { name: string; email: string; password: string }): Promise<{
      data?: unknown;
      error?: { message?: string; code?: string } | null;
    }>;
  };

  signIn: {
    email(input: { email: string; password: string }): Promise<{
      data?: unknown;
      error?: { message?: string; code?: string } | null;
    }>;
  };

  emailOtp: {
    verifyEmail(input: { email: string; otp: string }): Promise<{
      data?: unknown;
      error?: { message?: string; code?: string } | null;
    }>;

    sendVerificationOtp(input: {
      email: string;
      type: "email-verification" | "sign-in" | "forget-password";
    }): Promise<{
      data?: unknown;
      error?: { message?: string; code?: string } | null;
    }>;
  };

  twoFactor: {
    verifyTotp(input: { code: string; trustDevice?: boolean }): Promise<{
      data?: unknown;
      error?: { message?: string; code?: string } | null;
    }>;
  };
};

const authClient: ReturnType<typeof createAuthClient> & AuthClientExtraApi =
  createAuthClient({
    baseURL: env.VITE_API_BASE_URL,
    plugins: [emailOTPClient(), twoFactorClient()],
  }) as ReturnType<typeof createAuthClient> & AuthClientExtraApi;

export { authClient };
