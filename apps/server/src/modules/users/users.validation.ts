import { z } from "zod";

export const searchUsersSchema = z.object({
  body: z.object({
    q: z.string().trim().min(1, "Query is required"),
    type: z.enum(["invite"], {
      message: "Type must be either 'invite'",
    }),
    excludeSelf: z.boolean().default(true),
    limit: z.number().int().min(1).max(20).default(5),
  }),
});

export type SearchUsersInput = z.infer<typeof searchUsersSchema>["body"];