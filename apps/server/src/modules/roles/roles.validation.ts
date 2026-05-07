import { z } from "zod";

const roleNameSchema = z
  .string()
  .trim()
  .min(2, "Role name must be at least 2 characters")
  .max(100, "Role name must be at most 100 characters");

const roleDescriptionSchema = z
  .string()
  .trim()
  .max(255, "Description must be at most 255 characters")
  .optional();

const permissionKeySchema = z.string().trim().min(1);
const roleLevelSchema = z.coerce.number().int().min(0).max(100);

export const listRolesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    q: z.string().trim().optional().default(""),
  }),
  params: z.object({}),
});

export const roleIdParamSchema = z.object({
  params: z.object({
    roleId: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});

export const createRoleSchema = z.object({
  body: z.object({
    name: roleNameSchema,
    description: roleDescriptionSchema,
    level: roleLevelSchema.default(0),
    permissions: z.array(permissionKeySchema).default([]),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updateRoleSchema = z.object({
  body: z
    .object({
      name: roleNameSchema.optional(),
      description: z
        .string()
        .trim()
        .max(255, "Description must be at most 255 characters")
        .nullable()
        .optional(),
      level: roleLevelSchema.optional(),
      permissions: z.array(permissionKeySchema).optional(),
    })
    .refine(
      (value) =>
        value.name !== undefined ||
        value.description !== undefined ||
        value.level !== undefined ||
        value.permissions !== undefined,
      {
        message: "At least one field must be provided to update role",
      }
    ),
  params: z.object({
    roleId: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});

export const disableRoleSchema = z.object({
  params: z.object({
    roleId: z.coerce.number().int().positive(),
  }),
});

export const listRolePermissionsSchema = z.object({
  query: z.object({
    roleId: z.coerce.number().int().positive().optional(),
  }),
});
