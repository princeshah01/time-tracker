import type { Response } from "express";

import type { AppErrorCode } from "./app-error";

type ApiResponseBase = {
  status: number;
  success: boolean;
  message: string;
};

export type ApiSuccessResponse<TData = null> = ApiResponseBase & {
  success: true;
  data: TData;
  error: null;
};

export type ApiErrorBody<TDetails = unknown> = {
  code: AppErrorCode;
  details?: TDetails | null;
};

export type ApiErrorResponse<TDetails = unknown> = ApiResponseBase & {
  success: false;
  data: null;
  error: ApiErrorBody<TDetails>;
};

export type ApiResponse<TData = null, TDetails = unknown> =
  | ApiSuccessResponse<TData>
  | ApiErrorResponse<TDetails>;

type SendSuccessParams<TData = null> = {
  res: Response;
  data?: TData;
  message?: string;
  status?: number;
};

type SendErrorParams<TDetails = unknown> = {
  res: Response;
  message?: string;
  status?: number;
  code?: AppErrorCode;
  details?: TDetails | null;
};

export function sendSuccess<TData = null>({
  res,
  data = null as TData,
  message = "Success",
  status = 200,
}: SendSuccessParams<TData>): Response<ApiSuccessResponse<TData>> {
  return res.status(status).json({
    status,
    success: true,
    message,
    data,
    error: null,
  });
}

export function sendError<TDetails = unknown>({
  res,
  message = "Something went wrong",
  status = 500,
  code = "INTERNAL_SERVER_ERROR",
  details = null,
}: SendErrorParams<TDetails>): Response<ApiErrorResponse<TDetails>> {
  return res.status(status).json({
    status,
    success: false,
    message,
    data: null,
    error: {
      code,
      details,
    },
  });
}
