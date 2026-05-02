import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .optional(),
      image: z.url("Image must be a valid URL").nullable().optional(),
    })
    .strict(),

  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
