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
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/shared/hooks/use-auth";
import { updateProfile } from "../service";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type FormValues = z.infer<typeof schema>;

function ProfileSettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? "",
    },
    values: {
      name: user?.name ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    await updateProfile(values);
    await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
  }

  return (
    <main className="mx-auto w-full max-w-2xl p-6">
      <div className="space-y-1">
        <h1 className="font-semibold text-2xl">Profile settings</h1>
        <p className="text-muted-foreground text-sm">{user?.email}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Save profile</Button>
        </form>
      </Form>
    </main>
  );
}

export default ProfileSettingsPage;
