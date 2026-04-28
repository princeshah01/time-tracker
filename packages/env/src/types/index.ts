import type { z } from "zod";

export type Infer<T extends Record<string, z.ZodTypeAny>> = {
  [K in keyof T]: z.infer<T[K]>;
};

export type RuntimeEnv = Record<string, string | boolean | number | undefined>;
