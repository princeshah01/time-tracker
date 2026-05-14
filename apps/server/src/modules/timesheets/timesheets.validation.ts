import { z } from "zod";

const userIdsSchema = z
  .array(z.string().trim().min(1))
  .min(1, "At least one user must be added to the timesheet")
  .superRefine((userIds, ctx) => {
    const seen = new Set<string>();

    for (const [index, userId] of userIds.entries()) {
      if (seen.has(userId)) {
        ctx.addIssue({
          code: "custom",
          path: [index],
          message: "Each user can be added only once",
        });
      }

      seen.add(userId);
    }
  });

export const createTimesheetSchema = z.object({
  body: z
    .object({
      projectId: z.coerce.number().int().positive(),
      timesheetName: z.string().trim().min(2).max(160),
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
      userIds: userIdsSchema,
    })
    .strict()
    .superRefine((value, ctx) => {
      if (value.endDate.getTime() < value.startDate.getTime()) {
        ctx.addIssue({
          code: "custom",
          path: ["endDate"],
          message: "End date must be the same as or after start date",
        });
      }
    }),
  query: z.object({}),
  params: z.object({}),
});

export const updateTimesheetSchema = z.object({
  body: z
    .object({
      projectId: z.coerce.number().int().positive().optional(),
      timesheetName: z.string().trim().min(2).max(160).optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      userIds: userIdsSchema.optional(),
    })
    .strict()
    .superRefine((value, ctx) => {
      if (
        value.startDate &&
        value.endDate &&
        value.endDate.getTime() < value.startDate.getTime()
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["endDate"],
          message: "End date must be the same as or after start date",
        });
      }

      if (
        value.projectId === undefined &&
        value.timesheetName === undefined &&
        value.startDate === undefined &&
        value.endDate === undefined &&
        value.userIds === undefined
      ) {
        ctx.addIssue({
          code: "custom",
          message: "At least one field must be provided to update timesheet",
        });
      }
    }),
  params: z.object({
    timesheetId: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});

export const listTimesheetsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    q: z.string().trim().optional().default(""),
    projectName: z.string().trim().optional().default(""),
    projectId: z.coerce.number().int().positive().optional(),
  }),
  params: z.object({}),
});

export const timesheetIdParamSchema = z.object({
  params: z.object({
    timesheetId: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});

export type CreateTimesheetInput = z.infer<
  typeof createTimesheetSchema
>["body"];
export type ListTimesheetsInput = z.infer<typeof listTimesheetsSchema>["query"];
export type UpdateTimesheetInput = z.infer<
  typeof updateTimesheetSchema
>["body"];
