import { authClient } from "@/auth-client";
import { env } from "@/shared/config";
import type {
  ApiResponse,
  AuthStatePayload,
  ProfileMeResponse,
  Role,
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

async function authFetch<T>(path: string, body: Record<string, unknown>) {
  return apiFetch<T>(`/api/auth${path}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getMe(): Promise<AuthStatePayload> {
  const response =
    await apiFetch<ApiResponse<ProfileMeResponse>>("/api/profile/me");

  if (!response.success) {
    throw new Error(response.message);
  }

  const me = response.data;

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
  const response = await apiFetch<
    ApiResponse<{ accepted: boolean; email: string }>
  >(`/api/invites/${encodeURIComponent(input.token)}/accept`, {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      password: input.password,
    }),
  });

  if (!response.success) {
    throw new Error(response.message);
  }

  return response.data;
}

export async function getInvite(token: string) {
  const response = await apiFetch<
    ApiResponse<{
      email: string;
      role: Role;
      expiresAt: string;
    }>
  >(`/api/invites/${encodeURIComponent(token)}`);

  if (!response.success) {
    throw new Error(response.message);
  }

  return response.data;
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
