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
import { Input } from "@workspace/ui/components/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { requestPasswordResetOtp } from "../service/auth-service";
import { AuthPageLink, AuthResendNotice } from "./auth-layout";

const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid work email"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  const isSubmitted = form.formState.isSubmitSuccessful;

  async function onSubmit(values: ForgotPasswordFormValues) {
    setError(null);
    try {
      await requestPasswordResetOtp(values.email);
      navigate(`/reset-password?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to send OTP");
    }
  }

  return (
    <>
      {isSubmitted ? (
        <AuthResendNotice
          email={form.getValues("email")}
          onResend={() => form.handleSubmit(onSubmit)()}
        />
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-col justify-between gap-2">
                    <FormLabel className="text-[12px]">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@company.com"
                        className="h-9 text-[13px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[12px]" />
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              variant="secondary"
              className="h-9 w-full text-[13px]"
            >
              Send reset OTP
            </Button>
            {error ? (
              <p className="text-[12px] text-destructive">{error}</p>
            ) : null}
          </form>
        </Form>
      )}

      <AuthPageLink to="/auth">Back to sign in</AuthPageLink>
    </>
  );
}

export { ForgotPasswordForm };
