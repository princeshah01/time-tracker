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
import { z } from "zod";

import { acceptInvite, getMe } from "../service/auth-service";
import { PasswordFields } from "./password-fields";

const acceptInviteSchema = z
  .object({
    name: z.string().min(2, "Enter your full name"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type AcceptInviteFormValues = z.infer<typeof acceptInviteSchema>;

type AcceptInviteFormProps = {
  token: string;
  onDone: () => void;
};

function AcceptInviteForm({ token, onDone }: AcceptInviteFormProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<AcceptInviteFormValues>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: AcceptInviteFormValues) {
    setError(null);
    try {
      await acceptInvite({
        token,
        name: values.name,
        password: values.password,
      });
      await queryClient.fetchQuery({
        queryKey: ["auth", "me"],
        queryFn: getMe,
      });
      onDone();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to accept invite"
      );
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

        <PasswordFields control={form.control} />

        <Button type="submit" className="h-9 w-full text-[13px]">
          Accept invite
        </Button>
        {error ? <p className="text-[12px] text-destructive">{error}</p> : null}
      </form>
    </Form>
  );
}

export { AcceptInviteForm };
