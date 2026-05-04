import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp";
import { PasswordInput } from "@workspace/ui/components/input-password";
import { toast } from "@workspace/ui/components/sonner";
import { Switch } from "@workspace/ui/components/switch";
import { TabsContent } from "@workspace/ui/components/tabs";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { setUser, useAppDispatch, useAppSelector } from "@/app/store";
import { userService } from "@/features/user/user.service";
import { AppIcon } from "@/shared/components/app-icon";
import { authClient } from "@/shared/lib/auth-client";
import { SettingsSection } from "./settings-body";

type TfaStep = "idle" | "password" | "qr" | "verify";

type SecurityContentProps = {
  hasPassword: boolean;
  twoFactorEnabled: boolean;
  onSetPassword: (values: {
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  onUpdatePassword: (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void>;
  onSecurityChanged: () => Promise<void>;
};

function getAuthErrorMessage(
  error: { message?: string; code?: string } | null | undefined,
  fallback: string
) {
  return error?.message ?? fallback;
}

const passwordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const tfaPasswordSchema = z.object({
  password: z.string().min(1, "Current password is required."),
});

type TfaPasswordFormValues = z.infer<typeof tfaPasswordSchema>;

const totpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit code."),
});

type TotpFormValues = z.infer<typeof totpSchema>;

const SecuritySectionContent = () => {
  const { user } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  async function refetchMe() {
    const response = await userService.getProfile();

    if (!response.success || !response.data) {
      throw new Error("Failed to refresh your security settings.");
    }

    dispatch(setUser(response.data));
  }

  const onUpdatePassword: SecurityContentProps["onUpdatePassword"] = async ({
    currentPassword,
    newPassword,
  }) => {
    const result = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: false,
    });

    if (result.error) {
      throw new Error(
        getAuthErrorMessage(result.error, "Failed to update password.")
      );
    }

    await refetchMe();
  };

  const onSetPassword: SecurityContentProps["onSetPassword"] = async ({
    password,
  }) => {
    const result = await userService.setPassword(password);

    if (!result.success) {
      throw new Error(result.message ?? "Failed to set password.");
    }

    await refetchMe();
  };

  return (
    <TabsContent value="security" className="m-0">
      <SettingsSection
        title="Security"
        description="Manage your password and authenticator app security."
      >
        <SecurityContent
          onUpdatePassword={onUpdatePassword}
          onSetPassword={onSetPassword}
          onSecurityChanged={refetchMe}
          twoFactorEnabled={Boolean(user?.twoFactorEnabled)}
          hasPassword={Boolean(user?.hasPassword)}
        />
      </SettingsSection>
    </TabsContent>
  );
};

function SecurityContent({
  hasPassword,
  twoFactorEnabled,
  onSetPassword,
  onUpdatePassword,
  onSecurityChanged,
}: SecurityContentProps) {
  const [tfaStep, setTfaStep] = useState<TfaStep>("idle");
  const [totpURI, setTotpURI] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [tfaLoading, setTfaLoading] = useState(false);
  const [tfaError, setTfaError] = useState("");

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const tfaPasswordForm = useForm<TfaPasswordFormValues>({
    resolver: zodResolver(tfaPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const totpForm = useForm<TotpFormValues>({
    resolver: zodResolver(totpSchema),
    defaultValues: {
      code: "",
    },
  });

  function resetTfaFlow() {
    setTfaStep("idle");
    setTotpURI("");
    setTfaError("");
    tfaPasswordForm.reset();
    totpForm.reset();
  }

  useEffect(() => {
    if (!hasPassword) {
      resetTfaFlow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPassword]);

  async function handlePasswordSubmit(values: PasswordFormValues) {
    try {
      setSavingPassword(true);

      if (hasPassword) {
        await onUpdatePassword({
          currentPassword: values.currentPassword ?? "",
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        });

        toast.success("Password updated.");
      } else {
        await onSetPassword({
          password: values.newPassword,
          confirmPassword: values.confirmPassword,
        });

        toast.success("Password set.");
      }

      passwordForm.reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save password."
      );
    } finally {
      setSavingPassword(false);
    }
  }

  function handleTfaToggle(checked: boolean) {
    if (!hasPassword || tfaLoading) return;

    if (checked || twoFactorEnabled) {
      setTfaError("");
      setTfaStep("password");
      tfaPasswordForm.reset();
      totpForm.reset();
      return;
    }

    resetTfaFlow();
  }

  async function handleTfaPasswordContinue(values: TfaPasswordFormValues) {
    if (!hasPassword) return;

    try {
      setTfaLoading(true);
      setTfaError("");

      if (twoFactorEnabled) {
        const result = await authClient.twoFactor.disable({
          password: values.password,
        });

        if (result.error) {
          throw new Error(
            getAuthErrorMessage(
              result.error,
              "Failed to disable authenticator app."
            )
          );
        }

        resetTfaFlow();
        await onSecurityChanged();
        toast.success("Authenticator app disabled.");
        return;
      }

      const result = await authClient.twoFactor.enable({
        password: values.password,
      });

      if (result.error) {
        throw new Error(
          getAuthErrorMessage(
            result.error,
            "Failed to start authenticator setup."
          )
        );
      }

      if (!result.data?.totpURI) {
        throw new Error("Authenticator setup did not return a QR code.");
      }

      setTotpURI(result.data.totpURI);
      setTfaStep("qr");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update authenticator settings.";

      setTfaError(message);
      toast.error(message);
    } finally {
      setTfaLoading(false);
    }
  }

  async function handleVerifyTotp(values: TotpFormValues) {
    try {
      setTfaLoading(true);
      setTfaError("");

      const result = await authClient.twoFactor.verifyTotp({
        code: values.code.trim(),
      });

      if (result.error) {
        throw new Error(
          getAuthErrorMessage(
            result.error,
            "Failed to verify authenticator code."
          )
        );
      }

      resetTfaFlow();
      await onSecurityChanged();
      toast.success("Authenticator app enabled.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to verify authenticator code.";

      setTfaError(message);
      toast.error(message);
    } finally {
      setTfaLoading(false);
    }
  }

  const isSettingUpTfa = !twoFactorEnabled && tfaStep !== "idle";
  const tfaSwitchChecked = twoFactorEnabled || isSettingUpTfa;

  return (
    <div className="divide-y divide-border">
      <section className="p-4">
        <p className="text-[13px] font-medium">
          {hasPassword ? "Change Password" : "Set Password"}
        </p>

        <Form {...passwordForm}>
          <form
            className="mt-4 max-w-75 space-y-3"
            onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
          >
            {hasPassword && (
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <div className="flex flex-col gap-2">
                      <FormLabel className="text-[12px]">
                        Current Password
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          {...field}
                          autoComplete="current-password"
                          className="h-8 text-[13px]"
                        />
                      </FormControl>
                      <FormMessage className="text-[12px]" />
                    </div>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <div className="flex flex-col gap-2">
                    <FormLabel className="text-[12px]">
                      {hasPassword ? "New Password" : "Password"}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        autoComplete="new-password"
                        className="h-8 text-[13px]"
                      />
                    </FormControl>
                    <FormMessage className="text-[12px]" />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <div className="flex flex-col gap-2">
                    <FormLabel className="text-[12px]">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        autoComplete="new-password"
                        className="h-8 text-[13px]"
                      />
                    </FormControl>
                    <FormMessage className="text-[12px]" />
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="sm"
              className="h-8 text-[12px]"
              disabled={savingPassword}
            >
              {savingPassword && (
                <AppIcon
                  name="Loader"
                  className="mr-1.5 h-3.5 w-3.5 animate-spin"
                />
              )}
              {hasPassword ? "Update Password" : "Set Password"}
            </Button>
          </form>
        </Form>
      </section>

      <section className="p-4">
        <div className="max-w-lg space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[13px] font-medium">Authenticator App</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {hasPassword
                  ? "Use an authenticator app to add extra security."
                  : "Set a password first to enable authenticator app security."}
              </p>
            </div>

            {hasPassword && (
              <Switch
                checked={tfaSwitchChecked}
                disabled={!hasPassword || tfaLoading}
                onCheckedChange={handleTfaToggle}
              />
            )}
          </div>

          {hasPassword && tfaStep === "password" && (
            <Form {...tfaPasswordForm}>
              <form
                className="max-w-75 space-y-3"
                onSubmit={tfaPasswordForm.handleSubmit(
                  handleTfaPasswordContinue
                )}
              >
                <FormField
                  control={tfaPasswordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <div className="flex flex-col gap-2">
                        <FormLabel className="text-[12px]">
                          Current Password
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            {...field}
                            autoComplete="current-password"
                            placeholder={
                              twoFactorEnabled
                                ? "Required to disable authenticator"
                                : "Required to enable authenticator"
                            }
                            className="h-8 text-[13px]"
                          />
                        </FormControl>
                        <FormMessage className="text-[12px]" />
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="sm"
                  className="h-8 text-[12px]"
                  disabled={tfaLoading}
                >
                  {tfaLoading && (
                    <AppIcon
                      name="Loader"
                      className="mr-1.5 h-3.5 w-3.5 animate-spin"
                    />
                  )}
                  Continue
                </Button>
              </form>
            </Form>
          )}

          {hasPassword && tfaStep === "qr" && totpURI && (
            <div className="max-w-sm space-y-3 flex flex-col items-start">
              <div>
                <p className="text-[13px] font-medium">Scan QR Code</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Scan this QR code with your authenticator app.
                </p>
              </div>

              <div className="inline-flex rounded-md border border-border bg-white p-3">
                <QRCodeSVG value={totpURI} size={180} />
              </div>

              <Button
                type="button"
                size="sm"
                className="h-8 text-[12px]"
                onClick={() => {
                  setTfaError("");
                  totpForm.reset();
                  setTfaStep("verify");
                }}
              >
                Next
              </Button>
            </div>
          )}

          {hasPassword && tfaStep === "verify" && (
            <Form {...totpForm}>
              <form
                className="max-w-sm space-y-3"
                onSubmit={totpForm.handleSubmit(handleVerifyTotp)}
              >
                <FormField
                  control={totpForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <div className="flex flex-col gap-2">
                        <FormLabel className="text-[12px]">
                          Authenticator Code
                        </FormLabel>
                        <FormControl>
                          <InputOTP
                            maxLength={6}
                            value={field.value}
                            onChange={(value) =>
                              field.onChange(
                                value.replace(/\D/g, "").slice(0, 6)
                              )
                            }
                            onBlur={field.onBlur}
                            disabled={tfaLoading}
                          >
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormMessage className="text-[12px]" />
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="sm"
                  className="h-8 text-[12px]"
                  disabled={tfaLoading}
                >
                  {tfaLoading && (
                    <AppIcon
                      name="Loader"
                      className="mr-1.5 h-3.5 w-3.5 animate-spin"
                    />
                  )}
                  Verify
                </Button>
              </form>
            </Form>
          )}

          {hasPassword && tfaError && (
            <p className="text-[12px] text-destructive">{tfaError}</p>
          )}
        </div>
      </section>
    </div>
  );
}

export { SecuritySectionContent };
