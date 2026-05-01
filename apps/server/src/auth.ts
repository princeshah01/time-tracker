import { betterAuth } from "better-auth";
import { env } from "./env";
import { db } from "@/lib/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuthSecondaryStorage } from "@/lib/redis/secondary-storage";
import { apiKey } from "@better-auth/api-key"
import { emailOTP } from "better-auth/plugins"


export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,

  database: drizzleAdapter(db, { provider: "pg" }),

  trustedOrigins: [env.CLIENT_URL],
  
  // redis-based secondary storage for sessions and other data, to enable better performance and scalability

  secondaryStorage: betterAuthSecondaryStorage,

  plugins: [
    apiKey({
      storage: "secondary-storage",
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        console.log(`Send verification email to ${email} for ${type} with token: ${otp}`);
      },
      sendVerificationOnSignUp: true
    }),
  ],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  socialProviders: {
    microsoft: {
      clientId: env.MICROSOFT_CLIENT_ID,
      clientSecret: env.MICROSOFT_CLIENT_SECRET,
      tenantId: env.MICROSOFT_TENANT_ID, 
      authority: "https://login.microsoftonline.com",
      prompt: "select_account",
    },
  },
});
