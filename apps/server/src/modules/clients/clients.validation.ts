import { z } from "zod";

const nullableTrimmedString = (max: number) =>
  z.preprocess((value) => {
    if (typeof value !== "string") return value;

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }, z.string().max(max).nullable().optional());

export const listClientsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    q: z.string().trim().optional().default(""),
    status: z.enum(["active", "inactive"]).optional(),
  }),
  params: z.object({}),
});

export const autocompleteClientsSchema = z.object({
  query: z.object({
    q: z.string().trim().optional().default(""),
  }),
  params: z.object({}),
});

export const createClientSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(120),
      company: nullableTrimmedString(160),
      email: z.email().trim().toLowerCase(),
      phone: nullableTrimmedString(40),
      address: nullableTrimmedString(500),
      isActive: z.boolean().optional().default(true),
    })
    .strict(),
  query: z.object({}),
  params: z.object({}),
});

export const updateClientSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(120).optional(),
      company: nullableTrimmedString(160),
      email: z.email().trim().toLowerCase().optional(),
      phone: nullableTrimmedString(40),
      address: nullableTrimmedString(500),
      isActive: z.boolean().optional(),
    })
    .strict()
    .refine(
      (value) =>
        value.name !== undefined ||
        value.company !== undefined ||
        value.email !== undefined ||
        value.phone !== undefined ||
        value.address !== undefined ||
        value.isActive !== undefined,
      {
        message: "At least one field must be provided to update client",
      }
    ),
  params: z.object({
    clientId: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});

export const viewClientSchema = z.object({
  params: z.object({
    clientId: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});

export type ListClientsInput = z.infer<typeof listClientsSchema>["query"];
export type AutocompleteClientsInput = z.infer<
  typeof autocompleteClientsSchema
>["query"];
export type CreateClientInput = z.infer<typeof createClientSchema>["body"];
export type UpdateClientInput = z.infer<typeof updateClientSchema>["body"];
