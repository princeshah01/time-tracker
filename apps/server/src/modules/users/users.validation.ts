import { z } from "zod";

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    q: z.string().trim().optional().default(""),
    status: z.enum(["active", "inactive"]).optional(),
    role: z.string().trim().optional(),
  }),
  params: z.object({}),
});

export const searchUsersSchema = z.object({
  body: z
    .object({
      q: z.string().trim().min(1, "Query is required"),
      type: z.enum(["invite", "skills", "project-assign"], {
        message: "Type must be 'invite', 'skills', or 'project-assign'",
      }),
      role: z.enum(["manager", "lead", "member", "employee"]).optional(),
      excludeSelf: z.boolean().default(true),
      limit: z.number().int().min(1).max(20).default(5),
    })
    .strict(),
  query: z.object({}),
  params: z.object({}),
});

export const userIdParamSchema = z.object({
  params: z.object({
    userId: z.string().trim().min(1, "User id is required"),
  }),
  query: z.object({}),
});

export const salaryIdParamSchema = z.object({
  params: z.object({
    userId: z.string().trim().min(1, "User id is required"),
    salaryId: z.coerce.number().int().positive("Salary id is required"),
  }),
  query: z.object({}),
});

const skillSchema = z.string().trim().min(1).max(60);

export const updateUserSchema = z.object({
  body: z
    .object({
      isActive: z.boolean().optional(),
      name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name is too long")
        .optional(),
      roleId: z.coerce.number().int().positive().nullable().optional(),
      skills: z.array(skillSchema).max(50).optional(),
    })
    .strict()
    .refine(
      (value) =>
        value.isActive !== undefined ||
        value.name !== undefined ||
        value.roleId !== undefined ||
        value.skills !== undefined,
      {
        message: "At least one field must be provided to update user",
      }
    ),
  params: z.object({
    userId: z.string().trim().min(1, "User id is required"),
  }),
  query: z.object({}),
});

const salaryBodySchema = z
  .object({
    salary: z.coerce
      .number()
      .positive("Salary must be greater than zero")
      .max(9999999999.99, "Salary is too large"),
    effectiveDate: z.coerce.date(),
    note: z.string().trim().max(500).nullable().optional(),
  })
  .strict();

export const createUserSalarySchema = z.object({
  body: salaryBodySchema,
  params: z.object({
    userId: z.string().trim().min(1, "User id is required"),
  }),
  query: z.object({}),
});

export const updateUserSalarySchema = z.object({
  body: salaryBodySchema
    .partial()
    .refine(
      (value) =>
        value.salary !== undefined ||
        value.effectiveDate !== undefined ||
        value.note !== undefined,
      {
        message: "At least one field must be provided to update salary",
      }
    ),
  params: z.object({
    userId: z.string().trim().min(1, "User id is required"),
    salaryId: z.coerce.number().int().positive("Salary id is required"),
  }),
  query: z.object({}),
});

export type SearchUsersInput = z.infer<typeof searchUsersSchema>["body"];
export type ListUsersInput = z.infer<typeof listUsersSchema>["query"];
export type UpdateUserInput = z.infer<typeof updateUserSchema>["body"];
export type CreateUserSalaryInput = z.infer<
  typeof createUserSalarySchema
>["body"];
export type UpdateUserSalaryInput = z.infer<
  typeof updateUserSalarySchema
>["body"];
