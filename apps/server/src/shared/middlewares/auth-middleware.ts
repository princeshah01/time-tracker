import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema";
import { getAuthSession } from "@/shared/session";
import { AppError } from "@/shared/utils";

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const session = await getAuthSession(req);

  if (!session) {
    throw new AppError({
      message: "Please log in to access this resource.",
      code: "UNAUTHORIZED",
    });
  }

  const [userRecord] = await db
    .select({ isActive: user.isActive })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!userRecord?.isActive) {
    throw new AppError({
      message: "Your account is inactive. Please contact an administrator.",
      code: "FORBIDDEN",
    });
  }

  req.user = session.user;
  req.session = session;

  next();
}
