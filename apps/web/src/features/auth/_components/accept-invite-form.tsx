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
  onDone: () => void;
};

function AcceptInviteForm({ onDone }: AcceptInviteFormProps) {
  const form = useForm<AcceptInviteFormValues>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(_values: AcceptInviteFormValues) {
    onDone();
    return Promise.resolve();
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
      </form>
    </Form>
  );
}

export { AcceptInviteForm };
