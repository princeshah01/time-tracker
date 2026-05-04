import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { PasswordInput } from "@workspace/ui/components/input-password";
import { toast } from "@workspace/ui/components/sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";

const setPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SetPasswordFormValues = z.infer<typeof setPasswordSchema>;

type SetPasswordFormProps = {
  email?: string;
  description?: string;
  submitLabel?: string;
  onSubmit: (values: { password: string }) => Promise<void> | void;
};

function SetPasswordForm({
  email,
  description,
  submitLabel = "Set password",
  onSubmit,
}: SetPasswordFormProps) {
  const form = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function handleSubmit(values: SetPasswordFormValues) {
    try {
      await onSubmit({ password: values.password });
    } catch (error) {
      console.error("Failed to set password. Please try again.", error);
    }
  }

  const formDescription =
    description ??
    (email
      ? `Create a password for ${email}.`
      : "Create a secure password for your account.");

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-medium text-[15px]">Set your password</h2>
        <p className="text-[12px] text-muted-foreground">{formDescription}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  <FormLabel className="text-[12px]">New password</FormLabel>

                  <FormControl>
                    <PasswordInput
                      placeholder="Minimum 8 characters"
                      className="h-9 text-[13px]"
                      {...field}
                    />
                  </FormControl>

                  <FormDescription className="text-[12px] text-muted-foreground">
                    Use at least 8 characters with a mix of letters and numbers.
                  </FormDescription>

                  <FormMessage className="text-[12px]" />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  <FormLabel className="text-[12px]">
                    Confirm password
                  </FormLabel>

                  <FormControl>
                    <PasswordInput
                      placeholder="Re-enter new password"
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
            disabled={form.formState.isSubmitting}
            type="submit"
            className="h-9 w-full text-[13px]"
          >
            {form.formState.isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export { SetPasswordForm };
export type { SetPasswordFormProps, SetPasswordFormValues };
