import { z } from "zod";

const cursorSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string" || value.length === 0) return undefined;

    try {
      const parsed = JSON.parse(
        Buffer.from(value, "base64url").toString("utf8")
      );

      return parsed;
    } catch {
      return value;
    }
  },
  z
    .object({
      createdAt: z.string(),
      id: z.number().int().positive(),
    })
    .optional()
);

export const listNotificationsSchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().positive().max(100).default(20),
    cursor: cursorSchema,
  }),
  params: z.object({}),
});

export const notificationIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
});

export type ListNotificationsInput = z.infer<
  typeof listNotificationsSchema
>["query"];
