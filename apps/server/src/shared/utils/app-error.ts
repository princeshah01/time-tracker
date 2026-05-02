export type AppErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "METHOD_NOT_ALLOWED"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "UNPROCESSABLE_ENTITY"
  | "TOO_MANY_REQUESTS"
  | "INTERNAL_SERVER_ERROR"
  | "SERVICE_UNAVAILABLE";

const ERROR_STATUS_MAP: Record<AppErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

type AppErrorOptions = {
  message: string;
  code?: AppErrorCode;
  statusCode?: number;
  details?: unknown;
  isOperational?: boolean;
};

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: AppErrorCode;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor({
    message,
    code = "INTERNAL_SERVER_ERROR",
    statusCode,
    details,
    isOperational = true,
  }: AppErrorOptions) {
    super(message);

    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode ?? ERROR_STATUS_MAP[code];
    this.details = details;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}
