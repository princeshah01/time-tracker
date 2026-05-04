import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { toast } from "@workspace/ui/components/sonner";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  AuthDoneState,
  AuthLayout,
  SetPasswordForm,
} from "@/features/auth/_components";

function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email") ?? "invitee@company.com";
  const [done, setDone] = useState(false);

  async function handleSetPassword() {
    toast.success("Invite accepted.");
    setDone(true);
  }

  if (!token) {
    return (
      <AuthLayout
        eyebrow="Accept invite"
        description="Invite link is missing a token."
      >
        <AuthDoneState
          title="Invalid invite link"
          description="Request a new invitation and try again."
          actionLabel="Go to sign in"
          to="/auth"
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Accept invite"
      description="Your invite token is valid. Set your password to join the workspace."
    >
      {done ? (
        <AuthDoneState
          title="Invite accepted successfully"
          description="Your account is ready. Continue to sign in."
          actionLabel="Go to login"
          to="/auth"
        />
      ) : (
        <div className="space-y-4">
          <Alert>
            <AlertTitle className="text-[12px]">Invite verified</AlertTitle>
            <AlertDescription className="text-[12px]">
              You are joining as <span className="font-medium">{email}</span>.
            </AlertDescription>
          </Alert>

          <SetPasswordForm
            email={email}
            description="Create a password to complete invite acceptance."
            submitLabel="Accept invite"
            onSubmit={handleSetPassword}
          />
        </div>
      )}
    </AuthLayout>
  );
}

export default AcceptInvitePage;
