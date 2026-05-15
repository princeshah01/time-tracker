import { z } from "zod";

const taskStatusSchema = z.enum(["todo", "inprogress", "completed"]);

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

export const listTimesheetSheetsSchema = z.object({
  params: z.object({
    timesheetId: z.coerce.number().int().positive(),
  }),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(30),
    userId: z.string().trim().min(1).optional(),
  }),
});

export const searchTimesheetTasksSchema = z.object({
  params: z.object({
    timesheetId: z.coerce.number().int().positive(),
  }),
  query: z.object({
    q: z.string().trim().optional().default(""),
    limit: z.coerce.number().int().positive().max(5).default(5),
  }),
});

const sheetEntrySchema = z
  .object({
    taskId: z.coerce.number().int().positive().nullable().optional(),
    taskTitle: z.string().trim().min(2).max(160).optional(),
    taskStatus: taskStatusSchema.optional().default("todo"),
    hours: z.coerce.number().int().min(0).max(24).default(0),
    minutes: z.coerce.number().int().min(0).max(59).default(0),
  })
  .strict()
  .superRefine((value, ctx) => {
    const totalMinutes = value.hours * 60 + value.minutes;

    if (value.hours === 24 && value.minutes > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["minutes"],
        message: "Minutes must be 0 when hours is 24",
      });
    }

    if (totalMinutes > 0 && !value.taskId && !value.taskTitle?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["taskTitle"],
        message: "Task is required when time spent is greater than 0",
      });
    }
  });

export const upsertTimesheetSheetSchema = z.object({
  params: z.object({
    timesheetId: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
  body: z
    .object({
      entryDate: z.coerce.date(),
      userId: z.string().trim().min(1).optional(),
      entries: z.array(sheetEntrySchema).max(20).optional(),
      taskId: z.coerce.number().int().positive().nullable().optional(),
      taskTitle: z.string().trim().min(2).max(160).optional(),
      taskStatus: taskStatusSchema.optional().default("todo"),
      hours: z.coerce.number().int().min(0).max(24).optional(),
      minutes: z.coerce.number().int().min(0).max(59).optional(),
    })
    .strict()
    .superRefine((value, ctx) => {
      if (value.entries !== undefined) return;

      const hours = value.hours ?? 0;
      const minutes = value.minutes ?? 0;
      const totalMinutes = hours * 60 + minutes;

      if (hours === 24 && minutes > 0) {
        ctx.addIssue({
          code: "custom",
          path: ["minutes"],
          message: "Minutes must be 0 when hours is 24",
        });
      }

      if (totalMinutes > 0 && !value.taskId && !value.taskTitle?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["taskTitle"],
          message: "Task is required when time spent is greater than 0",
        });
      }
    }),
});

export const setTimesheetSheetLeaveSchema = z.object({
  params: z.object({
    timesheetId: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
  body: z
    .object({
      entryDate: z.coerce.date(),
      isLeave: z.boolean(),
    })
    .strict(),
});

export const setTimesheetSheetVerificationSchema = z.object({
  params: z.object({
    timesheetId: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
  body: z
    .object({
      userId: z.string().trim().min(1),
      isVerified: z.boolean(),
    })
    .strict(),
});

export type CreateTimesheetInput = z.infer<
  typeof createTimesheetSchema
>["body"];
export type ListTimesheetsInput = z.infer<typeof listTimesheetsSchema>["query"];
export type UpdateTimesheetInput = z.infer<
  typeof updateTimesheetSchema
>["body"];
export type ListTimesheetSheetsInput = z.infer<
  typeof listTimesheetSheetsSchema
>["query"];
export type SearchTimesheetTasksInput = z.infer<
  typeof searchTimesheetTasksSchema
>["query"];
export type UpsertTimesheetSheetInput = z.infer<
  typeof upsertTimesheetSheetSchema
>["body"];
export type SetTimesheetSheetLeaveInput = z.infer<
  typeof setTimesheetSheetLeaveSchema
>["body"];
export type SetTimesheetSheetVerificationInput = z.infer<
  typeof setTimesheetSheetVerificationSchema
>["body"];
