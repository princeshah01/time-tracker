import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { AcceptInviteForm, AuthDoneState, AuthLayout } from "../_components";

function AcceptInvitePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [isDone, setIsDone] = useState(false);

  if (isDone) {
    return (
      <AuthLayout eyebrow="Invite accepted">
        <AuthDoneState
          title="Your account is ready"
          description="Your invite has been accepted."
          actionLabel="Open dashboard"
          onAction={() => navigate("/dashboard")}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Accept invite"
      description="Finish your account setup from the admin invite link."
    >
      <AcceptInviteForm token={token} onDone={() => setIsDone(true)} />
    </AuthLayout>
  );
}

export default AcceptInvitePage;
