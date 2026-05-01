import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthDoneState, AuthLayout, ResetPasswordForm } from "../_components";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [isDone, setIsDone] = useState(false);

  if (isDone) {
    return (
      <AuthLayout eyebrow="Password updated">
        <AuthDoneState
          title="Your password is set"
          description="Use your new password to sign in to TimeTracker."
          actionLabel="Continue to sign in"
          onAction={() => navigate("/auth")}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Reset password"
      description="Create a new password from your secure magic link."
    >
      <ResetPasswordForm onDone={() => setIsDone(true)} />
    </AuthLayout>
  );
}

export default ResetPasswordPage;
