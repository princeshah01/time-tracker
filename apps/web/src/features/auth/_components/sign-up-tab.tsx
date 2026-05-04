import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { PasswordInput } from "@workspace/ui/components/input-password";
import { toast } from "@workspace/ui/components/sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { authService } from "@/features/auth";

const signUpSchema = z
  .object({
    name: z.string().min(2, "Enter your full name"),
    email: z.email("Enter a valid work email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    acceptTerms: z.boolean().refine((value) => value, {
      message: "Accept the terms to continue",
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

type SignUpTabProps = {
  onSubmitSuccess?: () => void;
};

function SignUpTab({ onSubmitSuccess }: SignUpTabProps) {
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  async function onSubmit(_values: SignUpFormValues) {
    const response = await authService.signUpWithEmail(_values);
    if (response.error) {
      toast.error(
        response.error.message || "An error occurred during sign-up."
      );
    } else {
      toast.success("Sign-up completed successfully.");
      onSubmitSuccess?.();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <div className="flex flex-col justify-between gap-2">
                <FormLabel className="text-[12px]">Full name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Alex Morgan"
                    className="h-9 text-[13px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[12px]" />
              </div>
            </FormItem>
          )}
        />

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

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex flex-col justify-between gap-2">
                <FormLabel className="text-[12px]">Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Minimum 8 characters"
                    className="h-9 text-[13px]"
                    {...field}
                  />
                </FormControl>
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
              <div className="flex flex-col justify-between gap-2">
                <FormLabel className="text-[12px]">Confirm password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Re-enter password"
                    className="h-9 text-[13px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[12px]" />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <div className="flex items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                  />
                </FormControl>
                <FormLabel className="font-normal text-[12px] text-muted-foreground">
                  I agree to the workspace terms
                </FormLabel>
              </div>
              <FormMessage className="text-[12px]" />
            </FormItem>
          )}
        />

        <Button type="submit" className="h-9 w-full text-[13px]">
          {form.formState.isSubmitting ? "Creating..." : "Create account"}
        </Button>
      </form>
    </Form>
  );
}

export { SignUpTab };
