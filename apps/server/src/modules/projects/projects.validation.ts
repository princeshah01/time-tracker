import { z } from "zod";

const nullableTrimmedString = (max: number) =>
  z.preprocess((value) => {
    if (typeof value !== "string") return value;

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }, z.string().max(max).nullable().optional());

const moneySchema = z.coerce.number().nonnegative().nullable().optional();

const teamMemberSchema = z
  .object({
    userId: z.string().trim().min(1),
    role: z.enum(["manager", "lead", "member"]),
  })
  .strict();

const billingMemberSchema = z
  .object({
    userId: z.string().trim().min(1),
    hourlyRate: moneySchema,
  })
  .strict();

const projectBodyShape = {
  name: z.string().trim().min(2).max(160),
  clientId: z.coerce.number().int().positive(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  description: nullableTrimmedString(2000),
  isActive: z.boolean().optional().default(true),
  startDate: z.coerce.date(),
  expectedEndDate: z.coerce.date().nullable().optional(),
  billingType: z.enum(["fixed_bill", "hours_worked"]),
  teamMembers: z.array(teamMemberSchema).optional().default([]),
};

function validateProjectBody(
  value: {
    startDate?: Date;
    expectedEndDate?: Date | null;
    teamMembers?: Array<{
      userId: string;
      role: "manager" | "lead" | "member";
    }>;
  },
  ctx: z.RefinementCtx
) {
  if (
    value.startDate &&
    value.expectedEndDate &&
    value.expectedEndDate.getTime() < value.startDate.getTime()
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["expectedEndDate"],
      message: "Expected end date must be after start date",
    });
  }

  const userIds = new Set<string>();
  let managerCount = 0;

  for (const [index, member] of (value.teamMembers ?? []).entries()) {
    if (userIds.has(member.userId)) {
      ctx.addIssue({
        code: "custom",
        path: ["teamMembers", index, "userId"],
        message: "Each user can be added only once",
      });
    }

    userIds.add(member.userId);

    if (member.role === "manager") managerCount += 1;
  }

  if (managerCount > 1) {
    ctx.addIssue({
      code: "custom",
      path: ["teamMembers"],
      message: "Only one project manager can be assigned",
    });
  }
}

const projectBodySchema = z
  .object(projectBodyShape)
  .strict()
  .superRefine(validateProjectBody);

const updateProjectBodySchema = z
  .object(projectBodyShape)
  .strict()
  .partial()
  .superRefine(validateProjectBody)
  .refine(
    (value) =>
      value.name !== undefined ||
      value.clientId !== undefined ||
      value.priority !== undefined ||
      value.description !== undefined ||
      value.isActive !== undefined ||
      value.startDate !== undefined ||
      value.expectedEndDate !== undefined ||
      value.billingType !== undefined ||
      value.teamMembers !== undefined,
    {
      message: "At least one field must be provided to update project",
    }
  );

export const listProjectsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    q: z.string().trim().optional().default(""),
    status: z.enum(["active", "inactive"]).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    billingType: z.enum(["fixed_bill", "hours_worked"]).optional(),
  }),
  params: z.object({}),
});

export const createProjectSchema = z.object({
  body: projectBodySchema,
  query: z.object({}),
  params: z.object({}),
});

export const updateProjectSchema = z.object({
  body: updateProjectBodySchema,
  params: z.object({
    projectId: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});

export const projectIdParamSchema = z.object({
  params: z.object({
    projectId: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});

export const updateProjectBillingSchema = z.object({
  body: z
    .object({
      totalProjectIncome: moneySchema,
      teamMembers: z.array(billingMemberSchema).optional().default([]),
    })
    .strict()
    .refine(
      (value) =>
        value.totalProjectIncome !== undefined || value.teamMembers.length > 0,
      {
        message: "At least one billing field must be provided",
      }
    ),
  params: z.object({
    projectId: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});

export type ListProjectsInput = z.infer<typeof listProjectsSchema>["query"];
export type CreateProjectInput = z.infer<typeof createProjectSchema>["body"];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>["body"];
export type UpdateProjectBillingInput = z.infer<
  typeof updateProjectBillingSchema
>["body"];
