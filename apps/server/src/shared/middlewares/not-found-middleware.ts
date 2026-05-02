import type { RequestHandler } from "express";

import { sendError } from "@/shared/utils";

export const notFoundMiddleware: RequestHandler = (req, res) => {
  return sendError({
    res,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    status: 404,
    code: "NOT_FOUND",
  });
};
