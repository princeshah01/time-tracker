import { z } from "zod";

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, "currentPassword is required"),
      newPassword: z.string().min(8, "Password must be at least 8 characters"),
      revokeOtherSessions: z.boolean().optional(),
    })
    .strict(),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const setPasswordSchema = z.object({
  body: z
    .object({
      newPassword: z.string().min(8, "Password must be at least 8 characters"),
    })
    .strict(),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const twoFactorPasswordSchema = z.object({
  body: z
    .object({
      password: z.string().min(1, "password is required"),
    })
    .strict(),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const verifyTwoFactorSchema = z.object({
  body: z
    .object({
      code: z.string().min(6, "code is required"),
      trustDevice: z.boolean().optional(),
    })
    .strict(),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});
