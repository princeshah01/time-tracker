import { createEnv } from "@t3-oss/env-core";
import type { z } from "zod";

type Infer<T extends Record<string, z.ZodTypeAny>> = {
  [K in keyof T]: z.infer<T[K]>;
};

type ImportMetaWithEnv = ImportMeta & {
  env: Record<string, string | undefined>;
};

export function createReactEnv<
  TClient extends Record<`VITE_${string}`, z.ZodTypeAny>,
  TServer extends Record<string, z.ZodTypeAny> = Record<string, never>,
>(opts: {
  client: TClient;
  server?: TServer;
}): Infer<TClient> & Infer<TServer> {
  return createEnv({
    client: opts.client,
    server: opts.server ?? ({} as TServer),
    clientPrefix: "VITE_",
    runtimeEnv: (import.meta as ImportMetaWithEnv).env,
    emptyStringAsUndefined: true,
  }) as Infer<TClient> & Infer<TServer>;
}
