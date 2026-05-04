import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { toast } from "@workspace/ui/components/sonner";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AuthDoneState,
  AuthLayout,
  MicrosoftAuthButton,
  OtpTab,
  ResendCountdownButton,
  SignInTab,
  SignUpTab,
} from "@/features/auth/_components";

import {
  AuthSteps,
  AuthStepValues,
  OtpResend,
} from "@/features/auth/auth.types";
import { authService } from "../auth.service";
import { userService } from "@/features/user/user.service";
import { useAppDispatch, setUser } from "@/app/store";

function AuthPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthSteps>("auth-tabs");
  const [stepValues, setStepValues] = useState<AuthStepValues>({});
  const dispatch = useAppDispatch();

  async function onLoginSucess() {
    toast.success("Logged in successfully");
    const response = await userService.getProfile();
    if (response.error) {
      toast.error("Failed to fetch user profile");
      return;
    }
    const payload = response.data;
    dispatch(setUser(payload));
    navigate("/dashboard");
  }

  function handleStepChange(newStep: AuthSteps, values: AuthStepValues) {
    setStep(newStep);
    setStepValues(values);
  }

  async function resendOtp(type: OtpResend) {
    const result = await authService.sendVerificationOtp({
      email: stepValues.email ?? "",
      type,
    });
    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    toast.success("Otp sent successfully");
  }

  async function onEmailVerify(values: { otp: string }) {
    const result = await authService.emailVerifyOtp({
      email: stepValues.email ?? "",
      otp: values.otp ?? "",
    });
    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    toast.success("Email verified successfully");
    navigate("/dashboard");
  }

  async function onTfaVerify(values: { otp: string }) {
    const result = await authService.signInTfa({
      otp: values.otp ?? "",
    });
    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    toast.success("2FA verification successful");
    onLoginSucess();
  }

  return (
    <AuthLayout>
      {step === "auth-tabs" ? (
        <>
          <MicrosoftAuthButton />
          <Tabs defaultValue="login">
            <TabsList className="grid h-9 w-full grid-cols-2 p-0.5">
              <TabsTrigger value="login" className="text-[12px]">
                Sign in
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-[12px]">
                Sign up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-4">
              <SignInTab
                onSubmitSuccess={onLoginSucess}
                handleStepChange={handleStepChange}
              />
            </TabsContent>

            <TabsContent value="signup" className="mt-4">
              <SignUpTab onSubmitSuccess={() => setStep("signup-otp")} />
            </TabsContent>
          </Tabs>
        </>
      ) : null}

      {step === "signin-tfa" ? (
        <OtpTab
          title="Verify authenticator code"
          description="Use the 6-digit code from your authenticator app."
          submitLabel="Verify and continue"
          onSubmit={onTfaVerify}
        />
      ) : null}

      {step === "signup-otp" ? (
        <div className="space-y-4">
          <OtpTab
            title="Check your inbox"
            description="Enter the 6-digit code sent to your email."
            submitLabel="Verify OTP"
            onSubmit={async () => {
              toast.success("OTP verified.");
              setStep("signup-success");
            }}
          />
          <ResendCountdownButton
            onResend={async () => {
              toast.info("A new OTP was sent.");
            }}
            seconds={30}
          />
        </div>
      ) : null}

      {step === "signup-success" ? (
        <AuthDoneState
          title="Signup successful"
          description="You can now sign in with your credentials."
          actionLabel="Go to sign in"
          onAction={() => setStep("auth-tabs")}
        />
      ) : null}
      {step === "email-verification" ? (
        <div className="space-y-4">
          <OtpTab
            title="Check your inbox"
            description="Enter the 6-digit code sent to your email."
            submitLabel="Verify Email"
            onSubmit={onEmailVerify}
          />
          <ResendCountdownButton
            onResend={() => resendOtp("email-verification")}
            seconds={30}
          />
        </div>
      ) : null}
    </AuthLayout>
  );
}

export default AuthPage;
