import { createEnv } from "@t3-oss/env-nextjs";
import type { z } from "zod";

type Infer<T extends Record<string, z.ZodTypeAny>> = {
  [K in keyof T]: z.infer<T[K]>;
};

export function createNextEnv<
  TClient extends Record<`NEXT_PUBLIC_${string}`, z.ZodTypeAny>,
  TServer extends Record<string, z.ZodTypeAny> = Record<string, never>,
>(opts: {
  client: TClient;
  server?: TServer;
}): Infer<TClient> & Infer<TServer> {
  return createEnv({
    client: opts.client,
    server: opts.server ?? ({} as TServer),
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
  }) as Infer<TClient> & Infer<TServer>;
}
