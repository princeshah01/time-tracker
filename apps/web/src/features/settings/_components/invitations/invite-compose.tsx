import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
import { settingsService } from "@/features/settings";
import { QUERY_KEYS } from "@/shared/constants";
import { capitalize } from "@/shared/lib";
import { InviteEmailCombobox } from "./invite-email-combobox";

const inviteSchema = z.object({
  email: z.string().email("Enter a valid email"),
  roleId: z.string().min(1, "Select a role"),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export function InviteCompose() {
  const queryClient = useQueryClient();
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      roleId: "",
    },
  });

  const { data: roles = [], isLoading: isRolesLoading } = useQuery({
    queryKey: [QUERY_KEYS.ASSIGNABLE_ROLES],
    queryFn: async () => {
      const response = await settingsService.listAssignableRoles();

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch roles");
      }

      return response.data.assignableRoles;
    },
  });

  const sendInviteMutation = useMutation({
    mutationFn: async (values: InviteFormValues) => {
      const response = await settingsService.sendInvite({
        email: values.email,
        roleId: Number(values.roleId),
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to send invitation");
      }

      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Invitation sent successfully");
      form.reset();
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.INVITATIONS],
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.INVITE_USER_SUGGESTIONS],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(values: InviteFormValues) {
    sendInviteMutation.mutate(values);
  }

  return (
    <div className="border-t p-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6 lg:gap-4 lg:flex-row lg:items-start"
        >
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
                      onChange={field.onChange}
                    />
                  </FormControl>

                  <FormMessage className="absolute -bottom-5 text-xs text-nowrap" />
                </div>
              </FormItem>
            )}
          />

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
                      disabled={isRolesLoading}
                    >
                      <SelectTrigger className="h-8 text-[12px] leading-none">
                        <SelectValue
                          placeholder={
                            isRolesLoading ? "Loading roles..." : "Select role"
                          }
                        />
                      </SelectTrigger>

                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem
                            key={role.value}
                            value={String(role.value)}
                          >
                            {capitalize(role.label)}
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

          <Button
            type="submit"
            size="sm"
            className="h-7.5 mt-5.5 gap-1.5 text-[12px]"
            disabled={sendInviteMutation.isPending}
          >
            <AppIcon name="Mail" className="size-3" />
            {sendInviteMutation.isPending ? "Sending..." : "Send Invite"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
