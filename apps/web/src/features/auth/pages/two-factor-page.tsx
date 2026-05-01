import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
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

import { authClient } from "@/auth-client";
import { AuthLayout } from "../_components";
import { getMe } from "../service/auth-service";

const schema = z.object({
  code: z.string().min(6, "Enter the 6-digit code"),
});

type FormValues = z.infer<typeof schema>;

function TwoFactorPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    const result = await authClient.twoFactor.verifyTotp({
      code: values.code,
      trustDevice: true,
    });

    if (result.error) {
      setError(result.error.message ?? "Invalid code");
      return;
    }

    await queryClient.fetchQuery({
      queryKey: ["auth", "me"],
      queryFn: getMe,
    });
    navigate("/dashboard");
  }

  return (
    <AuthLayout eyebrow="Two-factor authentication">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[12px]">
                  Authenticator code
                </FormLabel>
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
          <Button type="submit" className="h-9 w-full text-[13px]">
            Verify
          </Button>
          {error ? (
            <p className="text-[12px] text-destructive">{error}</p>
          ) : null}
        </form>
      </Form>
    </AuthLayout>
  );
}

export default TwoFactorPage;
