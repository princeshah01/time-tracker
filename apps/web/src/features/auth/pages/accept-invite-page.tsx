import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { Input } from "@workspace/ui/components/input";
import { toast } from "@workspace/ui/components/sonner";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  AuthDoneState,
  AuthLayout,
  OtpTab,
  ResendCountdownButton,
  SetPasswordForm,
} from "@/features/auth/_components";
import { authService } from "../auth.service";

type InviteState = "checking" | "otp" | "password" | "done" | "invalid";

function getErrorMessage(responseMessage: string, fallback: string) {
  return responseMessage || fallback;
}

function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [email, setEmail] = useState("");
  const [roleName, setRoleName] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<InviteState>(
    token ? "checking" : "invalid"
  );
  const [errorMessage, setErrorMessage] = useState(
    token ? "" : "Invite link is missing a token."
  );
  const startedRef = useRef(false);

  useEffect(() => {
    if (!token || startedRef.current) {
      return;
    }

    startedRef.current = true;

    async function startInviteFlow(inviteToken: string) {
      const verifyResponse = await authService.verifyInvitation(inviteToken);

      if (!verifyResponse.success) {
        setErrorMessage(
          getErrorMessage(verifyResponse.message, "Invitation is not valid.")
        );
        setState("invalid");
        return;
      }

      setEmail(verifyResponse.data.email);
      setRoleName(verifyResponse.data.role.name);

      const otpResponse = await authService.sendInvitationOtp(inviteToken);

      if (!otpResponse.success) {
        setErrorMessage(
          getErrorMessage(otpResponse.message, "Failed to send invitation OTP.")
        );
        setState("invalid");
        return;
      }

      toast.success("OTP sent to invited email.");
      setState("otp");
    }

    void startInviteFlow(token);
  }, [token]);

  async function handleResendOtp() {
    if (!token) return;

    const response = await authService.sendInvitationOtp(token);

    if (!response.success) {
      toast.error(getErrorMessage(response.message, "Failed to resend OTP."));
      return;
    }

    toast.success("OTP resent.");
  }

  async function handleVerifyOtp(values: { otp: string }) {
    if (!token) return;

    const response = await authService.verifyInvitationOtp({
      token,
      otp: values.otp,
    });

    if (!response.success) {
      toast.error(getErrorMessage(response.message, "Invalid OTP."));
      return;
    }

    toast.success("OTP verified.");
    setState("password");
  }

  async function handleSetPassword(values: { password: string }) {
    if (name.trim().length < 2) {
      toast.error("Enter your full name.");
      return;
    }

    const response = await authService.acceptInvitation({
      name: name.trim(),
      password: values.password,
    });

    if (!response.success) {
      toast.error(
        getErrorMessage(response.message, "Failed to accept invitation.")
      );
      return;
    }

    toast.success("Invite accepted.");
    setState("done");
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

  if (state === "checking") {
    return (
      <AuthLayout
        eyebrow="Accept invite"
        description="Checking your invitation and preparing verification."
      >
        <Alert>
          <AlertTitle className="text-[12px]">Checking invite</AlertTitle>
          <AlertDescription className="text-[12px]">
            Please wait while we verify your invite link.
          </AlertDescription>
        </Alert>
      </AuthLayout>
    );
  }

  if (state === "invalid") {
    return (
      <AuthLayout eyebrow="Accept invite" description={errorMessage}>
        <AuthDoneState
          title="Invalid invite link"
          description={errorMessage}
          actionLabel="Go to sign in"
          to="/auth"
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Accept invite"
      description="Verify the code sent to your invited email, then set your password."
    >
      {state === "done" ? (
        <AuthDoneState
          title="Invite accepted successfully"
          description="Your account is ready. Continue to sign in."
          actionLabel="Go to login"
          to="/auth"
        />
      ) : (
        <div className="space-y-4">
          <Alert>
            <AlertTitle className="text-[12px]">
              {state === "otp" ? "OTP sent" : "Invite verified"}
            </AlertTitle>
            <AlertDescription className="text-[12px]">
              You are joining as <span className="font-medium">{email}</span>
              {roleName ? ` with ${roleName} access.` : "."}
            </AlertDescription>
          </Alert>

          {state === "otp" ? (
            <div className="space-y-2">
              <OtpTab
                title="Verify invite OTP"
                description="Enter the 6-digit code sent to your invited email."
                submitLabel="Verify OTP"
                onSubmit={handleVerifyOtp}
              />
              <ResendCountdownButton seconds={60} onResend={handleResendOtp} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-medium text-[12px]" htmlFor="name">
                  Full name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  className="h-9 text-[13px]"
                />
              </div>
              <SetPasswordForm
                email={email}
                description="Create a password to complete invite acceptance."
                submitLabel="Accept invite"
                onSubmit={handleSetPassword}
              />
            </div>
          )}
        </div>
      )}
    </AuthLayout>
  );
}

export default AcceptInvitePage;
