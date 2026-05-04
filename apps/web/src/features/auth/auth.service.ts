import { authClient } from "@/shared/lib";
import { OtpResend } from "./auth.types";

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
};
