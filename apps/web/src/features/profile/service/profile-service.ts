import { env } from "@/shared/config";
import type {
  ApiResponse,
  ProfileMeResponse,
  UpdateProfileInput,
} from "@/shared/types";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${env.VITE_API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(error?.message ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export async function updateProfile(input: UpdateProfileInput) {
  const response = await apiFetch<ApiResponse<ProfileMeResponse>>(
    "/api/profile/me",
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  );

  if (!response.success) {
    throw new Error(response.message);
  }

  return response.data;
}

export function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}) {
  return apiFetch<ApiResponse<unknown>>("/api/security/change-password", {
    method: "POST",
    body: JSON.stringify(input),
  }).then((response) => {
    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data;
  });
}

export function setPassword(newPassword: string) {
  return apiFetch<ApiResponse<unknown>>("/api/security/set-password", {
    method: "POST",
    body: JSON.stringify({ newPassword }),
  }).then((response) => {
    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data;
  });
}

export function enableTwoFactor(password: string) {
  return apiFetch<ApiResponse<{ totpURI: string; backupCodes: string[] }>>(
    "/api/security/two-factor/setup",
    {
      method: "POST",
      body: JSON.stringify({ password }),
    }
  ).then((response) => {
    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data;
  });
}

export function verifyTwoFactor(code: string) {
  return apiFetch<ApiResponse<unknown>>("/api/security/two-factor/verify", {
    method: "POST",
    body: JSON.stringify({ code, trustDevice: true }),
  }).then((response) => {
    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data;
  });
}

export function disableTwoFactor(password: string) {
  return apiFetch<ApiResponse<unknown>>("/api/security/two-factor/disable", {
    method: "POST",
    body: JSON.stringify({ password }),
  }).then((response) => {
    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data;
  });
}
