import { authClient } from "@/auth-client";
import { env } from "@/shared/config";
import type { Permission, Role, User } from "@/shared/types";

export type MeResponse = {
  userInfo: User;
  role: Role | null;
  permissions: Permission[];
};

export type AuthStatePayload = {
  user: User;
  permissions: Permission[];
};

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

async function authFetch<T>(path: string, body: Record<string, unknown>) {
  return apiFetch<T>(`/api/auth${path}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getMe(): Promise<AuthStatePayload> {
  const me = await apiFetch<MeResponse>("/api/profile/me");

  return {
    user: {
      ...me.userInfo,
      role: me.role,
    },
    permissions: me.permissions,
  };
}

export async function signInWithEmail(input: {
  email: string;
  password: string;
  rememberMe?: boolean;
}) {
  return authClient.signIn.email({
    email: input.email,
    password: input.password,
    rememberMe: input.rememberMe,
    callbackURL: `${window.location.origin}/dashboard`,
  });
}

export async function signUpWithEmail(input: {
  name: string;
  email: string;
  password: string;
}) {
  return authClient.signUp.email({
    name: input.name,
    email: input.email,
    password: input.password,
    callbackURL: `${window.location.origin}/dashboard`,
  });
}

export async function verifySignupOtp(input: { email: string; otp: string }) {
  return authFetch("/email-otp/verify-email", input);
}

export async function requestPasswordResetOtp(email: string) {
  return authFetch("/email-otp/request-password-reset", { email });
}

export async function resetPasswordWithOtp(input: {
  email: string;
  otp: string;
  password: string;
}) {
  return authFetch("/email-otp/reset-password", input);
}

export async function acceptInvite(input: {
  token: string;
  name: string;
  password: string;
}) {
  return apiFetch<{ accepted: boolean; email: string }>(
    `/api/invites/${encodeURIComponent(input.token)}/accept`,
    {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        password: input.password,
      }),
    }
  );
}

export async function getInvite(token: string) {
  return apiFetch<{
    email: string;
    role: Role;
    expiresAt: string;
  }>(`/api/invites/${encodeURIComponent(token)}`);
}

export async function signOut() {
  await authClient.signOut();
}

export const authService = {
  getMe,
  signInWithEmail,
  signUpWithEmail,
  verifySignupOtp,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
  acceptInvite,
  getInvite,
  signOut,
};
