import { isAPIError } from "better-auth/api";

import { AppError, type AppErrorCode } from "./app-error";

function codeFromStatus(statusCode: number): AppErrorCode {
  switch (statusCode) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 422:
      return "VALIDATION_ERROR";
    case 429:
      return "TOO_MANY_REQUESTS";
    default:
      return "INTERNAL_SERVER_ERROR";
  }
}

function readStatusCode(error: unknown) {
  const candidate = error as {
    status?: unknown;
    statusCode?: unknown;
  };

  if (typeof candidate.statusCode === "number") {
    return candidate.statusCode;
  }

  if (typeof candidate.status === "number") {
    return candidate.status;
  }

  return 500;
}

function readMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Authentication request failed";
}

export async function runAuthApi<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (isAPIError(error)) {
      const statusCode = readStatusCode(error);

      throw new AppError({
        message: readMessage(error),
        statusCode,
        code: codeFromStatus(statusCode),
      });
    }

    throw error;
  }
}
