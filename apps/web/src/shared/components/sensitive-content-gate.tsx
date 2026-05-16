import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp";
import { toast } from "@workspace/ui/components/sonner";
import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { useAppSelector } from "@/app/store";
import { authService } from "@/features/auth";
import { AppIcon } from "@/shared/components/app-icon";
import type { User } from "@/shared/types";

type SensitiveContentGateProps = {
  children: ReactNode;
  user?: User | null;
  title?: string;
  description?: string;
  onVerifiedChange?: (verified: boolean) => void;
};

type VerifyFormValues = {
  credential: string;
};

function SensitiveContentGate({
  children,
  user: userProp,
  title = "Verify first to see data",
  description,
  onVerifiedChange,
}: SensitiveContentGateProps) {
  const navigate = useNavigate();
  const { user: currentUser } = useAppSelector((state) => state.user);
  const user = userProp ?? currentUser;
  const requiresOtp = Boolean(user?.twoFactorEnabled);
  const canVerify = requiresOtp || Boolean(user?.hasPassword);
  const [isVerified, setIsVerified] = useState(false);
  const verifySchema = useMemo(
    () =>
      z.object({
        credential: requiresOtp
          ? z
              .string()
              .trim()
              .length(6, "OTP must be 6 digits")
              .regex(/^\d+$/, "OTP must contain only digits")
          : z.string().trim().min(1, "Password is required"),
      }),
    [requiresOtp]
  );
  const form = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      credential: "",
    },
  });
  const isVerifying = form.formState.isSubmitting;

  useEffect(() => {
    form.reset({ credential: "" });
  }, [form, requiresOtp]);

  if (isVerified) {
    return <>{children}</>;
  }

  async function handleVerify(values: VerifyFormValues) {
    const credential = values.credential.trim();

    if (requiresOtp) {
      const response = await authService.verifyTotp({ otp: credential });

      if (response.error) {
        throw new Error(response.error.message || "OTP verification failed");
      }
    } else {
      const response = await authService.verifyPassword({
        password: credential,
      });

      if (!response.success) {
        throw new Error(response.message || "Password verification failed");
      }
    }

    form.reset({ credential: "" });
    setIsVerified(true);
    onVerifiedChange?.(true);
    toast.success("Verification completed");
  }

  function handleCredentialKeyDown(event: KeyboardEvent) {
    if (event.key !== "Enter") return;

    event.preventDefault();
    event.stopPropagation();
    void form.handleSubmit(handleVerifiedSubmit, () => {
      toast.error(requiresOtp ? "Enter a valid OTP" : "Password is required");
    })();
  }

  async function handleVerifiedSubmit(values: VerifyFormValues) {
    try {
      await handleVerify(values);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Verification failed"
      );
    }
  }

  return (
    <section className="rounded-md border border-border bg-card text-card-foreground">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[13px] font-medium">{title}</h2>
        </div>
        <p className="mt-1 text-[12px] text-muted-foreground">
          {description ??
            (requiresOtp
              ? "Enter your authenticator code to unlock this section."
              : "Enter your password to unlock this section.")}
        </p>
      </div>

      {canVerify ? (
        <Form {...form}>
          <div
            className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start"
            onKeyDown={(event) => event.stopPropagation()}
          >
            <FormField
              control={form.control}
              name="credential"
              render={({ field }) => (
                <FormItem className="min-w-0 flex-1 space-y-1">
                  <FormControl>
                    {requiresOtp ? (
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        pattern="^[0-9]*$"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        disabled={isVerifying}
                        onChange={(value) =>
                          field.onChange(value.replace(/\D/g, "").slice(0, 6))
                        }
                        onBlur={field.onBlur}
                        onKeyDown={handleCredentialKeyDown}
                      >
                        <InputOTPGroup className="gap-1">
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot
                              key={index}
                              index={index}
                              className="size-8 border border-input border-r text-[13px]"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    ) : (
                      <Input
                        {...field}
                        type="password"
                        autoComplete="current-password"
                        className="h-8 text-[13px]"
                        placeholder="Enter password"
                        disabled={isVerifying}
                        onKeyDown={handleCredentialKeyDown}
                      />
                    )}
                  </FormControl>
                  <FormMessage className="text-[12px]" />
                </FormItem>
              )}
            />
            <Button
              type="button"
              size="sm"
              className="h-8 shrink-0 gap-1.5 text-[12px]"
              disabled={isVerifying}
              onClick={() => void form.handleSubmit(handleVerifiedSubmit)()}
            >
              <AppIcon name="Lock" className="size-3.5" />
              {isVerifying ? "Verifying..." : "Verify"}
            </Button>
          </div>
        </Form>
      ) : (
        <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-muted-foreground">
            Set a password or enable an authenticator in security settings to
            access this section.
          </p>
          <Button
            type="button"
            size="sm"
            className="h-8 shrink-0 gap-1.5 text-[12px]"
            onClick={() => navigate("/settings?t=security")}
          >
            <AppIcon name="Settings" className="size-3.5" />
            Security settings
          </Button>
        </div>
      )}
    </section>
  );
}

export { SensitiveContentGate };
