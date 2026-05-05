import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";

import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { toast } from "@workspace/ui/components/sonner";

import { AppIcon } from "@/shared/components/app-icon";
import { InviteEmailCombobox } from "./invite-email-combobox";
import { INVITATION_EMAIL_SUGGESTIONS } from "./invitations.mock";
import type { InvitationRoleOption } from "./invitations.types";


// ✅ Schema
const inviteSchema = z.object({
  email: z.string().email("Enter a valid email"),
  roleId: z.string().min(1, "Select a role"),
});

type InviteComposeProps = {
  roles: InvitationRoleOption[];
};

export function InviteCompose({ roles }: InviteComposeProps) {
  const form = useForm({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      roleId: "",
    },
  });

  function onSubmit(values: z.infer<typeof inviteSchema>) {
    toast.success("Invitation ready to send.");
    console.log(values);
    form.reset();
  }

  return (
    <div className="border-t p-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-10 lg:gap-4 lg:flex-row lg:items-start"
        >
          {/* EMAIL */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="min-w-0 flex-1">
                <div className="relative flex flex-col gap-1">

                <FormLabel className="text-[12px]">Email</FormLabel>

                <FormControl>
                  <InviteEmailCombobox
                    value={field.value}
                    suggestions={INVITATION_EMAIL_SUGGESTIONS}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage className="absolute -bottom-5 text-xs text-nowrap" />
                </div>
              </FormItem>
            )}
          />

          {/* ROLE */}
          <FormField
            control={form.control}
            name="roleId"
            render={({ field }) => (
              <FormItem className="lg:w-56">
                                <div className="relative flex flex-col gap-1">

                <FormLabel className="text-[12px]">Role</FormLabel>

                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="h-8 text-[12px] leading-none">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>

                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>

                <FormMessage className="absolute -bottom-5 text-xs text-nowrap" />
                </div>
              </FormItem>
            )}
          />

          {/* BUTTON */}
          <Button
            type="submit"
            size="sm"
            className="h-7.5 mt-5.5 gap-1.5 text-[12px]"
          >
            <AppIcon name="Mail" className="size-3" />
            Send Invite
          </Button>
        </form>
      </Form>
    </div>
  );
}