import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";

import { auth } from "@/auth";

export async function getAuthSession(req: Request) {
  return auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
}

export type AuthSession = NonNullable<
  Awaited<ReturnType<typeof getAuthSession>>
>;
export type AuthUser = AuthSession["user"];
