import { createEnv } from "@t3-oss/env-core";
import type { z } from "zod";

import type { Infer, RuntimeEnv } from "./types";

type ImportMetaWithEnv = ImportMeta & {
  env: RuntimeEnv;
};

export function createReactEnv<
  TClient extends Record<`VITE_${string}`, z.ZodTypeAny>,
>(opts: { client: TClient; runtimeEnv?: RuntimeEnv }): Infer<TClient> {
  return createEnv<"VITE_", Record<string, never>, TClient>({
    client: opts.client as never,
    clientPrefix: "VITE_",
    runtimeEnvStrict: (opts.runtimeEnv ??
      (import.meta as ImportMetaWithEnv).env) as never,
    emptyStringAsUndefined: true,
  }) as Infer<TClient>;
}
