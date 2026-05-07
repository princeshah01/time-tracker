import { betterAuth } from "better-auth";
import {
  APIError,
  createAuthMiddleware,
  getSessionFromCtx,
} from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins/email-otp";
import { genericOAuth } from "better-auth/plugins/generic-oauth";
import { twoFactor } from "better-auth/plugins/two-factor";
import { eq } from "drizzle-orm";
import { AppError } from "@/shared/utils";
import { authService } from "@/modules/auth";
import {
  addAuthOtpEmailJob,
  addPasswordResetEmailJob,
} from "@/infrastructure/queue";
import { betterAuthRedisStorage } from "@/infrastructure/redis";
import { permissionsService } from "@/modules/permissions/permissions.service";
import { permissionKeys } from "@/shared/constants/role-permission";
import { env } from "@/config";
import { db } from "@/db";
import { user } from "@/db/schema";

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
  secondaryStorage: betterAuthRedisStorage,

  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
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

      // Microsoft-only users should NOT enable TFA before setting password.

      totpOptions: {
        digits: 6,
        period: 30,
        window: 3,
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
    sendResetPassword: async ({ user, token }) => {
      const url = `${env.CLIENT_URL}/reset-password/?token=${token}`;
      await addPasswordResetEmailJob({
        to: user.email,
        url,
      });
    },
  },
  emailVerification: {
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const protectedSecurityPaths = [
        "/two-factor/enable",
        "/two-factor/disable",
      ];

      function throwApiError(error: unknown) {
        if (error instanceof AppError) {
          throw new APIError(error.code as any, {
            message: error.message,
          });
        }

        throw error;
      }

      if (ctx.path === "/sign-in/email") {
        const email = (ctx.body as { email?: string } | undefined)?.email
          ?.trim()
          .toLowerCase();

        if (!email) return;

        try {
          await authService.requireActiveUserByEmail(email);
        } catch (error) {
          throwApiError(error);
        }

        return;
      }

      if (protectedSecurityPaths.includes(ctx.path)) {
        const session = await getSessionFromCtx(ctx);
        const userId = session?.user?.id;

        if (!userId) {
          throw new APIError("UNAUTHORIZED", {
            message: "Authentication required.",
          });
        }

        if (userId) {
          try {
            await authService.requireActiveUserById(userId);
          } catch (error) {
            throwApiError(error);
          }
        }

        try {
          await permissionsService.requirePermission(
            userId,
            permissionKeys.profileSecurityManage
          );
        } catch (error) {
          throwApiError(error);
        }

        return;
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        async after(user) {
          await permissionsService.attachDefaultRole(user.id);
        },
      },
    },
    session: {
      create: {
        async before(session) {
          const [record] = await db
            .select({ isActive: user.isActive })
            .from(user)
            .where(eq(user.id, session.userId))
            .limit(1);

          if (record && !record.isActive) {
            throw new APIError("FORBIDDEN", {
              message:
                "Your account is inactive. Please contact an administrator.",
            });
          }
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
    cookiePrefix: "time-tracker",
  },
});
