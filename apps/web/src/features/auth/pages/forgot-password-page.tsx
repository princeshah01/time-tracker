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
import { toast } from "@workspace/ui/components/sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthDoneState, AuthLayout } from "@/features/auth/_components";
import { authService } from "../auth.service";

const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid work email"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

function ForgotPasswordPage() {
  const [isLinkSent, setIsLinkSent] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function submitEmail(values: ForgotPasswordValues) {
    try {
      const result = await authService.requestPasswordReset({
        email: values.email,
      });

      if (result?.error) {
        toast.error(result.error.message ?? "Failed to send reset link");
        return;
      }

      toast.success("Reset link sent to your email");
      setIsLinkSent(true);
    } catch {
      toast.error("Something went wrong while sending reset link");
    }
  }

  return (
    <AuthLayout
      eyebrow="Forgot password"
      description={
        isLinkSent
          ? "Please check your email for the password reset link."
          : "Enter your email and we’ll send you a password reset link."
      }
    >
      {isLinkSent ? (
        <AuthDoneState
          title="Reset link sent"
          description="We sent a password reset link to your email. Please check your inbox."
          actionLabel="Back to sign in"
          to="/auth"
        />
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submitEmail)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-col gap-2">
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
              disabled={form.formState.isSubmitting}
              className="h-9 w-full text-[13px]"
            >
              {form.formState.isSubmitting ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        </Form>
      )}
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
