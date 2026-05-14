import { z } from "zod";

const taskStatusSchema = z.enum(["todo", "inprogress", "completed"]);

const nullableTrimmedString = (max: number) =>
  z.preprocess((value) => {
    if (typeof value !== "string") return value;

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }, z.string().max(max).nullable().optional());

export const listTasksSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    q: z.string().trim().optional().default(""),
    projectId: z.coerce.number().int().positive().optional(),
    status: taskStatusSchema.optional(),
  }),
  params: z.object({}),
});

export const createTaskSchema = z.object({
  body: z
    .object({
      projectId: z.coerce.number().int().positive(),
      title: z.string().trim().min(2).max(160),
      description: nullableTrimmedString(2000),
      status: taskStatusSchema.optional().default("todo"),
    })
    .strict(),
  query: z.object({}),
  params: z.object({}),
});

export const updateTaskSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(2).max(160).optional(),
      description: nullableTrimmedString(2000),
      status: taskStatusSchema.optional(),
    })
    .strict()
    .refine(
      (value) =>
        value.title !== undefined ||
        value.description !== undefined ||
        value.status !== undefined,
      {
        message: "At least one field must be provided to update task",
      }
    ),
  params: z.object({
    taskId: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});

export const taskIdParamSchema = z.object({
  params: z.object({
    taskId: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});

export type ListTasksInput = z.infer<typeof listTasksSchema>["query"];
export type CreateTaskInput = z.infer<typeof createTaskSchema>["body"];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>["body"];
