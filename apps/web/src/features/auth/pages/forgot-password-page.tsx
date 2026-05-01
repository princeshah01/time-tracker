import { AuthLayout, ForgotPasswordForm } from "../_components";

function ForgotPasswordPage() {
  return (
    <AuthLayout
      eyebrow="Password recovery"
      description="Send a secure password reset link to your work email."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
