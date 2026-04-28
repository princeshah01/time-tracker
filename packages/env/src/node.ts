import { createEnv } from "@t3-oss/env-core";
import type { z } from "zod";
import type { Infer, RuntimeEnv } from "./types";


function getProcessEnv(): RuntimeEnv {
  return (
    (
      globalThis as {
        process?: {
          env?: Record<string, string | undefined>;
        };
      }
    ).process?.env ?? {}
  );
}

export function createNodeEnv<TServer extends Record<string, z.ZodTypeAny>>(
  server: TServer,
  runtimeEnv: RuntimeEnv = getProcessEnv()
): Infer<TServer> {
  return createEnv({
    server,
    runtimeEnv,
    emptyStringAsUndefined: true,
  }) as Infer<TServer>;
}
