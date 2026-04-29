import { createEnv } from "@t3-oss/env-nextjs";
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

function collectRuntimeEnv<TSchema extends Record<string, z.ZodTypeAny>>(
  schema: TSchema,
  runtimeEnv: RuntimeEnv
): Record<keyof TSchema, string | boolean | number | undefined> {
  return Object.fromEntries(
    Object.keys(schema).map((key) => [key, runtimeEnv[key]])
  ) as Record<keyof TSchema, string | boolean | number | undefined>;
}

export function createNextEnv<
  TClient extends Record<`NEXT_PUBLIC_${string}`, z.ZodTypeAny> = Record<
    `NEXT_PUBLIC_${string}`,
    never
  >,
  TServer extends Record<string, z.ZodTypeAny> = Record<string, never>,
>(opts: {
  client?: TClient;
  server?: TServer;
  runtimeEnv?: RuntimeEnv;
}): Infer<TServer> & Infer<TClient> {
  const client = opts.client ?? ({} as TClient);
  const server = opts.server ?? ({} as TServer);
  const runtimeEnv = opts.runtimeEnv ?? getProcessEnv();

  return createEnv<TServer, TClient>({
    server: server as never,
    client: client as never,
    runtimeEnv: {
      ...collectRuntimeEnv(server, runtimeEnv),
      ...collectRuntimeEnv(client, runtimeEnv),
    } as never,
    emptyStringAsUndefined: true,
  }) as Infer<TServer> & Infer<TClient>;
}
