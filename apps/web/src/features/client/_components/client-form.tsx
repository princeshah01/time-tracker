import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { Switch } from "@workspace/ui/components/switch";
import { Textarea } from "@workspace/ui/components/textarea";

import type {
  ClientDetail,
  CreateClientInput,
  UpdateClientInput,
} from "../client.types";

const clientFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Client name must be at least 2 characters")
    .max(120, "Client name must be at most 120 characters"),
  company: z
    .string()
    .trim()
    .min(1, "Company name is required")
    .max(160, "Company name must be at most 160 characters"),
  email: z.email("Valid email is required"),
  phone: z.string().trim().max(40).optional(),
  address: z.string().trim().max(500).optional(),
  isActive: z.boolean(),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

type ClientFormProps = {
  client?: ClientDetail | null;
  mode: "create" | "edit";
  canSubmit: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: CreateClientInput | UpdateClientInput) => void;
};

function emptyToNull(value?: string) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

function toFormValues(client?: ClientDetail | null): ClientFormValues {
  return {
    name: client?.name ?? "",
    company: client?.company ?? "",
    email: client?.email ?? "",
    phone: client?.phone ?? "",
    address: client?.address ?? "",
    isActive: client?.isActive ?? true,
  };
}

function toPayload(values: ClientFormValues) {
  return {
    name: values.name.trim(),
    company: values.company.trim(),
    email: values.email.trim().toLowerCase(),
    phone: emptyToNull(values.phone),
    address: emptyToNull(values.address),
    isActive: values.isActive,
  };
}

function ClientForm({
  client,
  mode,
  canSubmit,
  isSubmitting,
  onCancel,
  onSubmit,
}: ClientFormProps) {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: toFormValues(client),
  });

  useEffect(() => {
    form.reset(toFormValues(client));
  }, [client, form]);

  function handleSubmit(values: ClientFormValues) {
    onSubmit(toPayload(values));
  }

  return (
    <Form {...form}>
      <form
        className="divide-y divide-border"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <section className="grid gap-4 p-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                <FormLabel className="text-[12px]">Client name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-8 text-[13px]"
                    placeholder="Acme Operations"
                    disabled={!canSubmit || isSubmitting}
                  />
                </FormControl>
                <FormMessage className="text-[12px]" />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  <FormLabel className="text-[12px]">Company name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-8 text-[13px]"
                      placeholder="Acme Inc"
                      required
                      disabled={!canSubmit || isSubmitting}
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
                <div className="flex flex-col gap-2">
                  <FormLabel className="text-[12px]">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-8 text-[13px]"
                      placeholder="client@company.com"
                      disabled={!canSubmit || isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-[12px]" />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  <FormLabel className="text-[12px]">Phone</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-8 text-[13px]"
                      placeholder="+1 555 0100"
                      disabled={!canSubmit || isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-[12px]" />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  <FormLabel className="text-[12px]">Status</FormLabel>
                  <div className="flex h-8 items-center justify-between rounded-md border px-3">
                  <span className="text-[13px]">
                    {field.value ? "Active" : "Inactive"}
                  </span>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!canSubmit || isSubmitting}
                    />
                  </FormControl>
                  </div>
                  <FormMessage className="text-[12px]" />
                </div>
              </FormItem>
            )}
          />
        </section>

        <section className="p-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  <FormLabel className="text-[12px]">Address</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="min-h-24 resize-none text-[13px]"
                      placeholder="Billing or office address"
                      disabled={!canSubmit || isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-[12px]" />
                </div>
              </FormItem>
            )}
          />
        </section>

        <footer className="flex justify-end gap-2 p-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-[12px]"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="h-8 text-[12px]"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : mode === "create"
                ? "Create client"
                : "Save changes"}
          </Button>
        </footer>
      </form>
    </Form>
  );
}

export { ClientForm };
