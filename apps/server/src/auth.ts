import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins/email-otp";
import { genericOAuth } from "better-auth/plugins/generic-oauth";
import { twoFactor } from "better-auth/plugins/two-factor";

import { db } from "@/lib/db";
import {
  addAuthOtpEmailJob,
  addPasswordResetOtpEmailJob,
} from "@/lib/queues/email";
import { betterAuthSecondaryStorage } from "@/lib/redis/secondary-storage";
import { permissionsService } from "@/modules/permissions/permissions.service";
import { env } from "./env";

type MicrosoftProfile = {
  sub?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  preferred_username?: string;
  picture?: string;
  email_verified?: boolean;
};

function isAllowedMicrosoftEmail(email: string | undefined) {
  if (!email) {
    return false;
  }

  return email.toLowerCase().endsWith(`@${env.MICROSOFT_ALLOWED_DOMAIN}`);
}

async function getMicrosoftUserInfo(tokens: { accessToken?: string }) {
  if (!tokens.accessToken) {
    return null;
  }

  const response = await fetch("https://graph.microsoft.com/oidc/userinfo", {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const profile = (await response.json()) as MicrosoftProfile;
  const email = profile.email ?? profile.preferred_username;

  if (!profile.sub || !isAllowedMicrosoftEmail(email)) {
    return null;
  }

  return {
    id: profile.sub,
    name:
      profile.name ??
      `${profile.given_name ?? ""} ${profile.family_name ?? ""}`.trim(),
    email: email ?? "",
    image: profile.picture,
    emailVerified: profile.email_verified ?? true,
  };
}

function mapEmailOtpPurpose(type: string) {
  if (type === "sign-in") {
    return "sign-in";
  }

  if (type === "change-email") {
    return "change-email";
  }

  return "email-verification";
}

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,

  database: drizzleAdapter(db, { provider: "pg" }),

  trustedOrigins: [env.CLIENT_URL],
  secondaryStorage: betterAuthSecondaryStorage,

  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "forget-password") {
          await addPasswordResetOtpEmailJob({
            to: email,
            otp,
          });
          return;
        }

        await addAuthOtpEmailJob({
          to: email,
          otp,
          purpose: mapEmailOtpPurpose(type),
        });
      },
      expiresIn: 5 * 60,
      otpLength: 6,
      allowedAttempts: 5,
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
      storeOTP: "hashed",
    }),
    twoFactor({
      issuer: "TimeTracker",
      otpOptions: {
        period: 5,
        digits: 6,
        allowedAttempts: 5,
        storeOTP: "hashed",
        async sendOTP({ user, otp }) {
          await addAuthOtpEmailJob({
            to: user.email,
            otp,
            purpose: "two-factor",
          });
        },
      },
      totpOptions: {
        digits: 6,
        period: 30,
      },
      backupCodeOptions: {
        amount: 10,
        length: 10,
        storeBackupCodes: "encrypted",
      },
    }),
    genericOAuth({
      config: [
        {
          providerId: "microsoft",
          clientId: env.MICROSOFT_CLIENT_ID,
          clientSecret: env.MICROSOFT_CLIENT_SECRET,
          authorizationUrl: `https://login.microsoftonline.com/${env.MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize`,
          tokenUrl: `https://login.microsoftonline.com/${env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
          scopes: ["openid", "profile", "email"],
          prompt: "select_account",
          getUserInfo: getMicrosoftUserInfo,
          overrideUserInfo: true,
        },
      ],
    }),
  ],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    minPasswordLength: 8,
    revokeSessionsOnPasswordReset: true,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
  },
  databaseHooks: {
    user: {
      create: {
        async after(user) {
          await permissionsService.attachDefaultRole(user.id);
        },
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
  },
});
