import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Switch } from "@workspace/ui/components/switch";
import { toast } from "@workspace/ui/components/sonner";
import { cn } from "@workspace/ui/lib/utils";

import { userManageService } from "@/features/users-mange";
import type {
  UpdateUserInput,
  UserDetail,
  UserListItem,
} from "@/features/users-mange";
import { AppIcon } from "@/shared/components/app-icon";
import { TagSelect } from "@/shared/components/tag-select";
import { env } from "@/shared/config";
import { QUERY_KEYS } from "@/shared/constants";
import { capitalize, formatDate, getInitials } from "@/shared/lib";
import type { AssignableRole } from "../../settings.type";

const userEditSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Valid email is required"),
  roleId: z.string().trim().min(1, "Role is required"),
  isActive: z.boolean(),
  skills: z.array(z.string().trim().min(1)),
});

type UserEditFormValues = z.infer<typeof userEditSchema>;

type UserDetailDialogProps = {
  user: UserListItem | null;
  roles: AssignableRole[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function getImageUrl(image?: string | null) {
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  return `${env.VITE_API_BASE_URL}${image}`;
}

function toFormValues(user: UserDetail): UserEditFormValues {
  return {
    name: user.name,
    email: user.email,
    roleId: user.roleId ? String(user.roleId) : "",
    isActive: user.isActive,
    skills: user.skills,
  };
}

function toPayload(values: UserEditFormValues): UpdateUserInput {
  return {
    name: values.name.trim(),
    roleId: Number(values.roleId),
    isActive: values.isActive,
    skills: [
      ...new Set(
        values.skills
          .map((skill) => skill.trim())
          .filter((skill) => skill.length > 0)
      ),
    ],
  };
}

function UserDetailDialog({
  user,
  roles,
  open,
  onOpenChange,
}: UserDetailDialogProps) {
  const queryClient = useQueryClient();
  const userId = user?.id;

  const form = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      name: "",
      email: "",
      roleId: "",
      isActive: true,
      skills: [],
    },
  });

  const userDetailQuery = useQuery({
    queryKey: [QUERY_KEYS.USER_DETAIL, userId],
    enabled: open && Boolean(userId),
    queryFn: async () => {
      if (!userId) throw new Error("User id is required");

      const response = await userManageService.viewUser(userId);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch user");
      }

      return response.data;
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (input: { userId: string; data: UpdateUserInput }) => {
      const response = await userManageService.updateUser(
        input.userId,
        input.data
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update user");
      }

      return response.data;
    },
    onSuccess: (updatedUser) => {
      toast.success("User updated successfully");
      queryClient.setQueryData(
        [QUERY_KEYS.USER_DETAIL, updatedUser.id],
        updatedUser
      );
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USER_DETAIL, updatedUser.id],
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const currentUser = userDetailQuery.data;
  const watchedIsActive = form.watch("isActive");

  const roleOptions = useMemo(() => {
    if (!currentUser?.roleId) return roles;

    const hasCurrentRole = roles.some(
      (role) => role.value === currentUser.roleId
    );

    return hasCurrentRole
      ? roles
      : [
          ...roles,
          {
            value: currentUser.roleId,
            label: currentUser.roleName ?? "Current role",
          },
        ];
  }, [currentUser?.roleId, currentUser?.roleName, roles]);

  useEffect(() => {
    if (open && currentUser) {
      form.reset(toFormValues(currentUser));
    }
  }, [currentUser, form, open]);

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [form, open]);

  function handleSubmit(values: UserEditFormValues) {
    if (!currentUser) return;

    updateUserMutation.mutate({
      userId: currentUser.id,
      data: toPayload(values),
    });
  }

  const title = currentUser?.name ?? user?.name ?? "User details";
  const description = currentUser?.email ?? user?.email ?? "Loading user";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User details</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {userDetailQuery.isLoading ? (
          <UserDetailSkeleton />
        ) : userDetailQuery.isError ? (
          <UserDetailError onRetry={() => void userDetailQuery.refetch()} />
        ) : currentUser ? (
          <Form {...form}>
            <form
              className="space-y-5"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <div className="flex items-center gap-3 rounded-md border bg-linear-to-r from-[#FF5555] to-[#6025F5] p-3">
                <Avatar className="size-14">
                  <AvatarImage
                    src={getImageUrl(currentUser.image)}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-[13px]">
                    {getInitials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div
                    className="truncate font-medium text-[14px]"
                    title={title}
                  >
                    {title}
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "mt-1 text-[11px]",
                      watchedIsActive
                        ? "border-success bg-success/10 text-success"
                        : "border-muted bg-muted text-muted-foreground"
                    )}
                  >
                    {watchedIsActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px]">Name</FormLabel>
                      <FormControl>
                        <Input className="h-9 text-[13px]" {...field} />
                      </FormControl>
                      <FormMessage className="text-[12px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px]">Email</FormLabel>
                      <FormControl>
                        <Input
                          className="h-9 text-[13px]"
                          disabled
                          readOnly
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[12px]" />
                    </FormItem>
                  )}
                />

                <InfoBlock
                  label="Joined"
                  value={formatDate(currentUser.createdAt)}
                />

                <InfoBlock
                  label="Email verified"
                  value={currentUser.emailVerified ? "Verified" : "Unverified"}
                />

                <FormField
                  control={form.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px]">Role</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={updateUserMutation.isPending}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9 text-[13px]">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem
                              key={role.value}
                              value={String(role.value)}
                            >
                              {capitalize(role.label)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[12px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px]">Status</FormLabel>
                      <div className="flex h-9 items-center justify-between rounded-md border px-3">
                        <span className="text-[13px]">
                          {field.value ? "Active" : "Inactive"}
                        </span>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={updateUserMutation.isPending}
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="text-[12px]" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px]">Skills</FormLabel>
                    <FormControl>
                      <TagSelect
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Add skill and press Enter"
                        disabled={updateUserMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage className="text-[12px]" />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={updateUserMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function UserDetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-md border p-3">
        <Skeleton className="size-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-20 w-full" />
      </div>

      <div className="flex justify-end gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  );
}

function UserDetailError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
      <div className="font-medium text-[13px] text-destructive">
        Failed to load user
      </div>
      <p className="mt-1 text-[12px] text-muted-foreground">
        The selected user could not be fetched. Try again.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3 h-8 text-[12px]"
        onClick={onRetry}
      >
        <AppIcon name="Loader" className="size-3.5" />
        Retry
      </Button>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 space-y-1">
      <div className="text-[12px] font-medium">{label}</div>
      <div className="flex h-9 items-center rounded-md border bg-muted/30 px-3 text-[13px]">
        <span className="truncate" title={value}>
          {value}
        </span>
      </div>
    </div>
  );
}

export { UserDetailDialog };
