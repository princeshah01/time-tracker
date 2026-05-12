import type { ErrorRequestHandler, Request } from "express";

import { AppError, loggerServer, sendError } from "@/shared/utils";

const DEFAULT_ERROR_MESSAGE = "Something went wrong";

function formatRequestContext(req: Request) {
  return `${req.method} ${req.originalUrl}`;
}

function getFirstValidationMessage(details: unknown): string | null {
  if (!details || typeof details !== "object") {
    return null;
  }

  const validationDetails = details as {
    errors?: unknown;
    properties?: Record<string, unknown>;
    items?: unknown[];
  };

  if (
    Array.isArray(validationDetails.errors) &&
    typeof validationDetails.errors[0] === "string"
  ) {
    return validationDetails.errors[0];
  }

  for (const property of Object.values(validationDetails.properties ?? {})) {
    const message = getFirstValidationMessage(property);

    if (message) {
      return message;
    }
  }

  for (const item of validationDetails.items ?? []) {
    const message = getFirstValidationMessage(item);

    if (message) {
      return message;
    }
  }

  return null;
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

    const message =
      err.code === "VALIDATION_ERROR"
        ? (getFirstValidationMessage(err.details) ?? err.message)
        : err.message;

    return sendError({
      res,
      message,
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
