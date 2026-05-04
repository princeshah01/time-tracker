import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name is too long")
        .optional(),
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

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
export type SetPasswordSchema = z.infer<typeof setPasswordSchema>;
