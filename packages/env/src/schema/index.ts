import { z } from "zod";

export const nonEmptyString = z.string().min(1);
export const port = z.coerce.number().int().min(1).max(65535);
export const positiveInt = z.coerce
  .number()
  .min(1)
  .max(Number.MAX_SAFE_INTEGER);
export const url = z.url();
export const nodeEnv = z.enum(["development", "test", "production"]);
