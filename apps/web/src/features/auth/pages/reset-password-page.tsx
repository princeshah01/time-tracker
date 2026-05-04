import { toast } from "@workspace/ui/components/sonner";
import { useSearchParams } from "react-router";

import {
  AuthDoneState,
  AuthLayout,
  SetPasswordForm,
} from "@/features/auth/_components";
import { authService } from "../auth.service";
import { useState } from "react";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [isSuccess, setIsSuccess] = useState(false);

  const token = searchParams.get("token");

  const handlePasswordReset = async (values: { password: string }) => {
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }
    try {
      const result = await authService.resetPassword({
        token,
        newPassword: values.password,
      });

      if (result?.error) {
        toast.error(result.error.message ?? "Failed to reset password");
        return;
      }

      toast.success("Password reset successful");
      setIsSuccess(true);
    } catch (error) {
      toast.error("Failed to reset password");
    }
  };

  if (!token) {
    return (
      <AuthLayout
        eyebrow="Reset password"
        description="Your password reset link is invalid or expired."
      >
        <AuthDoneState
          title="Invalid reset link"
          description="Please request a new password reset link and try again."
          actionLabel="Back to forgot password"
          to="/auth/forgot-password"
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Reset password"
      description="Create a new password for your account."
    >
      {isSuccess ? (
        <AuthDoneState
          title="Password reset successful"
          description="Your password has been updated. Sign in with your new password."
          actionLabel="Go to sign in"
          to="/auth"
        />
      ) : (
        <SetPasswordForm
          description="Create a new password for your account."
          submitLabel="Save new password"
          onSubmit={handlePasswordReset}
        />
      )}
    </AuthLayout>
  );
}

export default ResetPasswordPage;
