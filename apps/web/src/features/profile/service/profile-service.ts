import { env } from "@/shared/config";

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

export function updateProfile(input: { name: string; image?: string | null }) {
  return apiFetch("/api/profile/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}) {
  return apiFetch("/api/security/change-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function setPassword(newPassword: string) {
  return apiFetch("/api/security/set-password", {
    method: "POST",
    body: JSON.stringify({ newPassword }),
  });
}

export function enableTwoFactor(password: string) {
  return apiFetch<{ totpURI: string; backupCodes: string[] }>(
    "/api/security/two-factor/setup",
    {
      method: "POST",
      body: JSON.stringify({ password }),
    }
  );
}

export function verifyTwoFactor(code: string) {
  return apiFetch("/api/security/two-factor/verify", {
    method: "POST",
    body: JSON.stringify({ code, trustDevice: true }),
  });
}

export function disableTwoFactor(password: string) {
  return apiFetch("/api/security/two-factor/disable", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}
