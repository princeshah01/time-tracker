import type { ErrorRequestHandler, Request } from "express";

import { AppError, loggerServer, sendError } from "@/shared/utils";

const DEFAULT_ERROR_MESSAGE = "Something went wrong";

function formatRequestContext(req: Request) {
  return `${req.method} ${req.originalUrl}`;
}

export const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof AppError) {
    if (!err.isOperational) {
      loggerServer.error(
        `Non-operational error at ${formatRequestContext(req)}: ${err.message}`,
        err
      );

      return sendError({
        res,
        message: DEFAULT_ERROR_MESSAGE,
        status: 500,
        code: "INTERNAL_SERVER_ERROR",
      });
    }

    return sendError({
      res,
      message: err.message,
      status: err.statusCode,
      code: err.code,
      details: err.details ?? null,
    });
  }

  const errorMessage = err instanceof Error ? err.message : String(err);
  loggerServer.error(
    `Unhandled error at ${formatRequestContext(req)}: ${errorMessage}`,
    err
  );

  return sendError({
    res,
    message: DEFAULT_ERROR_MESSAGE,
    status: 500,
    code: "INTERNAL_SERVER_ERROR",
  });
};
