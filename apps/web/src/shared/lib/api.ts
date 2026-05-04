import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

import { env } from "@/shared/config";
import { authClient } from "@/shared/lib/auth-client";
import type { ApiResponse } from "@/shared/types";

const api: AxiosInstance = axios.create({
  baseURL: `${env.VITE_API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = (error.config ?? {}) as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const session = await authClient.getSession();

        if (session?.data?.user) {
          return api(originalRequest);
        }
        return Promise.reject(error);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    if (error.response) {
      return Promise.resolve(error.response);
    }

    return Promise.reject(error);
  }
);

export async function apiFetch<TData = unknown, TDetails = unknown>(
  config: AxiosRequestConfig
): Promise<ApiResponse<TData, TDetails>> {
  const response = await api(config);
  return response.data as ApiResponse<TData, TDetails>;
}

export { api };
