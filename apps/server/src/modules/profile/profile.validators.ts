import { z } from "zod";

const skillSchema = z.string().trim().min(1).max(60);

const profileSkillsSchema = z.preprocess((value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : value;
  } catch {
    return trimmed.split(",");
  }
}, z.array(skillSchema).max(50));

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name is too long")
        .optional(),
      skills: profileSkillsSchema.optional(),
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

export const verifyPasswordSchema = z.object({
  body: z
    .object({
      password: z.string().min(1, "Password is required"),
    })
    .strict(),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
export type SetPasswordSchema = z.infer<typeof setPasswordSchema>;
export type VerifyPasswordSchema = z.infer<typeof verifyPasswordSchema>;
