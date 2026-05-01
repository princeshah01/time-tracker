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
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthPageLink, AuthResendNotice } from "./auth-layout";

const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid work email"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

function ForgotPasswordForm() {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  const isSubmitted = form.formState.isSubmitSuccessful;

  function onSubmit(_values: ForgotPasswordFormValues) {
    return Promise.resolve();
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

            <Button type="submit" variant="secondary" className="h-9 w-full text-[13px]">
              Send reset link
            </Button>
          </form>
        </Form>
      )}

      <AuthPageLink to="/auth">Back to sign in</AuthPageLink>
    </>
  );
}

export { ForgotPasswordForm };
