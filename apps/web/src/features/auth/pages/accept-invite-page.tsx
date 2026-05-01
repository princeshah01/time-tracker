import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { AcceptInviteForm, AuthDoneState, AuthLayout } from "../_components";

function AcceptInvitePage() {
  const navigate = useNavigate();
  const [isDone, setIsDone] = useState(false);

  if (isDone) {
    return (
      <AuthLayout eyebrow="Invite accepted">
        <AuthDoneState
          title="Your account is ready"
          description="Sign in with the password you just created."
          actionLabel="Go to sign in"
          onAction={() => navigate("/auth")}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Accept invite"
      description="Finish your account setup from the admin invite link."
    >
      <AcceptInviteForm onDone={() => setIsDone(true)} />
    </AuthLayout>
  );
}

export default AcceptInvitePage;
