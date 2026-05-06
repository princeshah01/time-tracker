import { z } from "zod";

const tokenSchema = z.string().trim().min(1, "Invitation token is required");

export const createInvitationSchema = z.object({
  body: z
    .object({
      email: z.email("Valid email is required").trim().toLowerCase(),
      roleId: z.coerce.number().int().positive("Role id is required"),
    })
    .strict(),
  query: z.object({}),
  params: z.object({}),
});

export const listInvitationsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    q: z.string().trim().optional().default(""),
    status: z.enum(["expired", "pending", "accepted", "revoked"]).optional(),
  }),
  params: z.object({}),
});

export const verifyInvitationSchema = z.object({
  query: z.object({
    token: tokenSchema,
  }),
  params: z.object({}),
});

export const sendInvitationOtpSchema = z.object({
  body: z
    .object({
      token: tokenSchema,
    })
    .strict(),
  query: z.object({}),
  params: z.object({}),
});

export const verifyInvitationOtpSchema = z.object({
  body: z
    .object({
      token: tokenSchema,
      otp: z
        .string()
        .trim()
        .regex(/^\d{6}$/, "OTP must be 6 digits"),
    })
    .strict(),
  query: z.object({}),
  params: z.object({}),
});

export const acceptInvitationSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2, "Name must be at least 2 characters"),
      password: z.string().min(8, "Password must be at least 8 characters"),
    })
    .strict(),
  query: z.object({}),
  params: z.object({}),
});

export const revokeInvitationSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});
