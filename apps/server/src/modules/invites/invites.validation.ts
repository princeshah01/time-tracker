import { z } from "zod";

export const createInviteSchema = z.object({
  body: z
    .object({
      email: z.email("Valid email is required").trim().toLowerCase(),
      roleId: z.number().int().positive("Role id is required"),
    })
    .strict(),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const inviteTokenSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    token: z.string().min(1, "Invite token is required"),
  }),
});

export const acceptInviteSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2, "Name must be at least 2 characters"),
      password: z.string().min(8, "Password must be at least 8 characters"),
    })
    .strict(),
  query: z.object({}).optional(),
  params: z.object({
    token: z.string().min(1, "Invite token is required"),
  }),
});

export type CreateInviteSchema = z.infer<typeof createInviteSchema>;
export type InviteTokenSchema = z.infer<typeof inviteTokenSchema>;
export type AcceptInviteSchema = z.infer<typeof acceptInviteSchema>;
