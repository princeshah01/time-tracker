import { authClient } from "@/shared/lib";
import { apiFetch } from "@/shared/lib/api";
import type { OtpResend } from "./auth.types";

type InvitationVerifyResponse = {
  id: number;
  email: string;
  role: {
    id: number;
    name: string;
    description: string | null;
  };
  status: "pending" | "accepted" | "expired" | "revoked";
  expiresAt: string;
};

export const authService = {
  signUpWithEmail: async (input: {
    name: string;
    email: string;
    password: string;
  }) => {
    const response = await authClient.signUp.email(input);
    return response;
  },
  signInWithEmail: async (input: { email: string; password: string }) => {
    const response = await authClient.signIn.email(input);
    return response;
  },
  emailVerifyOtp: async (input: { email: string; otp: string }) => {
    const result = await authClient.emailOtp.verifyEmail(input);
    return result;
  },
  sendVerificationOtp: async (input: { email: string; type: OtpResend }) => {
    const result = await authClient.emailOtp.sendVerificationOtp(input);
    return result;
  },
  requestPasswordReset: async (input: { email: string }) => {
    const result = await authClient.requestPasswordReset(input);
    return result;
  },
  resetPassword: async (input: { token: string; newPassword: string }) => {
    const result = await authClient.resetPassword(input);
    return result;
  },
  continueWithMicrosoft: async () => {
    const result = await authClient.signIn.social({
      provider: "microsoft",
      callbackURL: `${window.location.origin}/dashboard`,
    });
    return result;
  },
  signInTfa: async (input: { otp: string }) => {
    const result = await authClient.twoFactor.verifyTotp({
      code: input.otp.trim(),
      trustDevice: true,
    });
    return result;
  },
  verifyInvitation: async (token: string) => {
    return apiFetch<InvitationVerifyResponse>({
      method: "GET",
      url: "/invitations/verify",
      params: { token },
    });
  },
  sendInvitationOtp: async (token: string) => {
    return apiFetch<{ email: string; expiresAt: string }>({
      method: "POST",
      url: "/invitations/send-otp",
      data: { token },
    });
  },
  verifyInvitationOtp: async (input: { token: string; otp: string }) => {
    return apiFetch<{ email: string; verified: boolean }>({
      method: "POST",
      url: "/invitations/verify-otp",
      data: input,
    });
  },
  acceptInvitation: async (input: { name: string; password: string }) => {
    return apiFetch<{ accepted: boolean; email: string; userId: string }>({
      method: "POST",
      url: "/invitations/accept",
      data: input,
    });
  },
};
