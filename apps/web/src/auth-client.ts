import { emailOTPClient, twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { env } from "./shared/config";

type TwoFactorClientApi = {
  twoFactor: {
    verifyTotp(input: { code: string; trustDevice?: boolean }): Promise<{
      data?: unknown;
      error?: { message?: string } | null;
    }>;
  };
};

const authClient: ReturnType<typeof createAuthClient> & TwoFactorClientApi =
  createAuthClient({
    baseURL: env.VITE_API_BASE_URL,
    plugins: [
      emailOTPClient(),
      twoFactorClient({
        twoFactorPage: "/two-factor",
      }),
    ],
  }) as ReturnType<typeof createAuthClient> & TwoFactorClientApi;

export { authClient };
