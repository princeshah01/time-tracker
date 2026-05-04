export type AuthSteps =
  | "auth-tabs"
  | "signin-tfa"
  | "signup-otp"
  | "signup-success"
  | "email-verification";

export type AuthStepValues = {
  email?: string;
};

export type OtpResend = "email-verification" | "sign-in" | "forget-password";
