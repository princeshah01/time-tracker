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
import { Link } from "react-router-dom";
import { z } from "zod";
import { authService } from "../auth.service";
import { AuthSteps, AuthStepValues } from "../auth.types";

const signInSchema = z.object({
  email: z.email("Enter a valid work email"),
  password: z.string().min(1, "Enter your password"),
  rememberMe: z.boolean(),
});

type SignInFormValues = z.infer<typeof signInSchema>;

type SignInTabProps = {
  onSubmitSuccess?: () => void;
};

function SignInTab({
  onSubmitSuccess,
  handleStepChange,
}: SignInTabProps & {
  handleStepChange: (newStep: AuthSteps, values: AuthStepValues) => void;
}) {
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });
  const { isSubmitting } = form.formState;

  async function onSubmit(_values: SignInFormValues) {
    try {
      await form.trigger();
      const values = form.getValues();
      const result = await authService.signInWithEmail({
        email: values.email,
        password: values.password,
      });
      console.log({ result });
      if (result.error) {
        if (result.error.code === "EMAIL_NOT_VERIFIED") {
          handleStepChange("email-verification", { email: values.email });
          toast.error(
            "Email not verified. Please check your inbox for the verification email."
          );
          return;
        }
        throw new Error(result.error.message);
      }
      if ((result.data as any)?.twoFactorRedirect) {
        // TODO: will implemet later once profile section done.
        handleStepChange("signin-tfa", { email: values.email });
        return;
      }
      onSubmitSuccess?.();
    } catch (error) {
      let message = "Something went wrong";
      if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message);
      console.error("Sign in error:", message);
    }
  }

  return (
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

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-3">
                <FormLabel className="text-[12px]">Password</FormLabel>
                <Link
                  to="/forgot-password"
                  className="text-[12px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <PasswordInput
                  placeholder="Enter password"
                  className="h-9 text-[13px]"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[12px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                />
              </FormControl>
              <FormLabel className="font-normal text-[12px] text-muted-foreground">
                Keep me signed in
              </FormLabel>
            </FormItem>
          )}
        />

        <Button
          disabled={isSubmitting}
          type="submit"
          className="h-9 w-full text-[13px]"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </Form>
  );
}

export { SignInTab };
