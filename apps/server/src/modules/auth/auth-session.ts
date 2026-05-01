import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";

import { auth } from "@/auth";
import { HttpError } from "@/shared/http/http-error";

export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
export type SessionUser = NonNullable<AuthSession>["user"];

export async function getAuthSession(req: Request) {
  return auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
}

export async function requireAuthSession(req: Request) {
  const session = await getAuthSession(req);

  if (!session?.user) {
    throw new HttpError(401, "Unauthorized");
  }

  return session;
}
