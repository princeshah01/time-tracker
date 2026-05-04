import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";

import { auth } from "@/auth";
import { AppError } from "../utils";

export async function getAuthSession(req: Request) {
  return auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
}

export function requireRouteUser(req: Request) {
  if (!req.user) {
    throw new AppError({
      message: "Please log in to access this resource.",
      code: "UNAUTHORIZED",
    });
  }

  return req.user;
}

export type AuthSession = NonNullable<
  Awaited<ReturnType<typeof getAuthSession>>
>;
export type AuthUser = AuthSession["user"];
