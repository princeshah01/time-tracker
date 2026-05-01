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
import { z } from "zod";

import { resetPasswordWithOtp } from "../service/auth-service";
import { PasswordFields } from "./password-fields";

const resetPasswordSchema = z
  .object({
    otp: z.string().min(6, "Enter the email OTP"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

type ResetPasswordFormProps = {
  email: string;
  onDone: () => void;
};

function ResetPasswordForm({ email, onDone }: ResetPasswordFormProps) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    setError(null);
    try {
      await resetPasswordWithOtp({
        email,
        otp: values.otp,
        password: values.password,
      });
      onDone();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to reset password"
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[12px]">Email OTP</FormLabel>
              <FormControl>
                <Input
                  className="h-9 text-[13px]"
                  inputMode="numeric"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[12px]" />
            </FormItem>
          )}
        />
        <PasswordFields control={form.control} />

        <Button type="submit" className="h-9 w-full text-[13px]">
          Set password
        </Button>
        {error ? <p className="text-[12px] text-destructive">{error}</p> : null}
      </form>
    </Form>
  );
}

export { ResetPasswordForm };
