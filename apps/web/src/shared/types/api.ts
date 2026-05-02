export type ApiSuccessResponse<TData> = {
  status: number;
  success: true;
  message: string;
  data: TData;
  error: null;
};

export type ApiErrorResponse<TDetails = unknown> = {
  status: number;
  success: false;
  message: string;
  data: null;
  error: {
    code: string;
    details?: TDetails | null;
  };
};

export type ApiResponse<TData, TDetails = unknown> =
  | ApiSuccessResponse<TData>
  | ApiErrorResponse<TDetails>;
