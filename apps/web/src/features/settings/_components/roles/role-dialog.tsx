import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { toast } from "@workspace/ui/components/sonner";

import { PermissionsView } from "./permission-view";
import { settingsService } from "@/features/settings/settings.service";
import type {
  RoleListItem,
  RolePermission,
} from "@/features/settings/settings.type";

const roleFormSchema = z.object({
  name: z
    .string()
    .min(3, "Role name must be at least 3 characters long")
    .max(50, "Role name must be at most 50 characters long"),
  description: z.string().optional(),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

type RoleViewDialogProps = {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  selectedRole: RoleListItem | null;
};

const RoleViewDialog = ({
  dialogOpen,
  setDialogOpen,
  selectedRole,
}: RoleViewDialogProps) => {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(selectedRole);

  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set()
  );

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const roleDetailsQuery = useQuery({
    queryKey: ["role-details", selectedRole?.id],
    enabled: dialogOpen,
    queryFn: async () => {
      // If there is a selected role, fetch its details (including permissions)
      if (selectedRole?.id) {
        const response = await settingsService.viewRole(selectedRole.id);

        if (!response.success || !response.data) {
          throw new Error(response.message || "Failed to fetch role details");
        }

        return response.data;
      }
      // if no selected role, we are in create mode, so we just need to fetch the list of all permissions to show in the form
      const response = await settingsService.listPermissions();

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch permissions");
      }

      return {
        name: "",
        description: "",
        permissions: response.data.permissions,
      };
    },
  });

  const permissionOptions = useMemo<RolePermission[]>(() => {
    return roleDetailsQuery.data?.permissions ?? [];
  }, [roleDetailsQuery.data]);

  useEffect(() => {
    if (!dialogOpen) return;

    if (!selectedRole) {
      form.reset({
        name: "",
        description: "",
      });
      setSelectedPermissions(new Set());
      return;
    }

    form.reset({
      name: selectedRole.name,
      description: selectedRole.description ?? "",
    });
  }, [dialogOpen, selectedRole, form]);

  useEffect(() => {
    if (!dialogOpen || !roleDetailsQuery.data) return;

    form.reset({
      name: roleDetailsQuery.data.name ?? selectedRole?.name ?? "",
      description:
        roleDetailsQuery.data.description ?? selectedRole?.description ?? "",
    });

    setSelectedPermissions(
      new Set(
        permissionOptions
          .filter((permission) => permission.include)
          .map((permission) => permission.name)
      )
    );
  }, [
    dialogOpen,
    roleDetailsQuery.data,
    permissionOptions,
    selectedRole,
    form,
  ]);

  // create Role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (values: RoleFormValues) => {
      const response = await settingsService.createRole({
        name: values.name,
        description: values.description ?? "",
        permissions: Array.from(selectedPermissions),
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to create role");
      }

      return response;
    },
    onSuccess: () => {
      toast.success("Role created successfully");
      setDialogOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async (values: RoleFormValues) => {
      if (!selectedRole) {
        throw new Error("No role selected");
      }

      const response = await settingsService.updateRole(selectedRole.id, {
        name: values.name,
        description: values.description ?? "",
        permissions: Array.from(selectedPermissions),
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to update role");
      }

      return response;
    },
    onSuccess: () => {
      toast.success("Role updated successfully");
      setDialogOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["roles"] });
      void queryClient.invalidateQueries({
        queryKey: ["role-details", selectedRole?.id],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const isSaving = createRoleMutation.isPending || updateRoleMutation.isPending;
  const isDefaultRole = Boolean(selectedRole?.isDefault);

  function handleSubmit(values: RoleFormValues) {
    if (isDefaultRole) return;

    if (isEditMode) {
      updateRoleMutation.mutate(values);
      return;
    }

    createRoleMutation.mutate(values);
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Role" : "Create Role"}</DialogTitle>
          <DialogDescription>
            Configure role details and permissions for this role.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-col gap-2">
                      <FormLabel className="text-xs">Role Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter role name"
                          disabled={isDefaultRole || isSaving}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-col gap-2">
                      <FormLabel className="text-xs">Description</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter description"
                          disabled={isDefaultRole || isSaving}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium">Permissions</p>
              <PermissionsView
                permissions={permissionOptions}
                isLoading={roleDetailsQuery.isLoading}
                selected={selectedPermissions}
                disabled={isDefaultRole || isSaving}
                onToggle={(name, checked) => {
                  setSelectedPermissions((prev) => {
                    const next = new Set(prev);

                    if (checked) {
                      next.add(name);
                    } else {
                      next.delete(name);
                    }

                    return next;
                  });
                }}
              />
            </div>

            <DialogFooter>
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>

              <Button
                size="sm"
                type="submit"
                disabled={
                  isSaving ||
                  isDefaultRole ||
                  roleDetailsQuery.isLoading ||
                  roleDetailsQuery.isError
                }
              >
                {isEditMode ? "Save changes" : "Create role"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { RoleViewDialog };
