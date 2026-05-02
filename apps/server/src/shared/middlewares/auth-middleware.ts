import type { NextFunction, Request, Response } from "express";

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

  req.user = session.user;
  req.session = session;

  next();
}
