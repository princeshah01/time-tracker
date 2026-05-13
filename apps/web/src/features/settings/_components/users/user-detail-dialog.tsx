import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Calendar } from "@workspace/ui/components/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { toast } from "@workspace/ui/components/sonner";
import { Switch } from "@workspace/ui/components/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAppSelector } from "@/app/store";
import type {
  UpdateUserInput,
  UpsertUserSalaryInput,
  UserDetail,
  UserListItem,
  UserSalaryHistoryItem,
} from "@/features/users-mange";
import { userManageService } from "@/features/users-mange";
import { AppIcon } from "@/shared/components/app-icon";
import { PermissionsWrapper } from "@/shared/components/permission-wrapper";
import { TagSelect } from "@/shared/components/tag-select";
import { env } from "@/shared/config";
import { permissions, QUERY_KEYS } from "@/shared/constants";
import { capitalize, formatDate, getInitials } from "@/shared/lib";
import { hasPermission } from "@/shared/lib/permissions";
import type { AssignableRole } from "../../settings.type";

const userEditSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("Valid email is required"),
  roleId: z.string().trim().min(1, "Role is required"),
  isActive: z.boolean(),
  skills: z.array(z.string().trim().min(1)),
});

type UserEditFormValues = z.infer<typeof userEditSchema>;

const salaryFormSchema = z.object({
  salary: z.number().positive("Salary is required"),
  effectiveDate: z.string().trim().min(1, "Effective date is required"),
  note: z.string().trim().max(500).optional(),
});

type SalaryFormValues = z.infer<typeof salaryFormSchema>;

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

function toSalaryPayload(values: SalaryFormValues): UpsertUserSalaryInput {
  return {
    salary: values.salary,
    effectiveDate: values.effectiveDate,
    note: values.note?.trim() || null,
  };
}

function toDateInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function formatSalary(value?: string | number | null) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Not set";

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatSignedSalary(value?: string | number | null) {
  if (value === undefined || value === null) return "Not available";

  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Not available";
  const formatted = formatSalary(Math.abs(amount));

  if (amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted}`;
  return formatted;
}

function formatPercentage(value?: string | number | null) {
  if (value === undefined || value === null) return "Not available";

  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Not available";

  if (amount > 0) return `+${amount.toFixed(2)}%`;
  return `${amount.toFixed(2)}%`;
}

function UserDetailDialog({
  user,
  roles,
  open,
  onOpenChange,
}: UserDetailDialogProps) {
  const { permissions: currentUserPermissions } = useAppSelector((s) => s.user);
  const hasUserManagePermission = hasPermission(currentUserPermissions, [
    permissions.userManage,
  ]);
  const hasFinancialPermission = hasPermission(currentUserPermissions, [
    permissions.userManageFinancial,
  ]);

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

  useEffect(() => {
    if (!open) return;
    if (!currentUser) return;

    form.reset(toFormValues(currentUser));
  }, [open, currentUser?.id, form]);

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
      <DialogContent className="flex h-[85vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
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
              className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1"
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

              <Tabs defaultValue="basic" className="space-y-4">
                <TabsList className="h-8 rounded-md bg-muted/40 p-1">
                  <TabsTrigger value="basic" className="h-6 text-[12px]">
                    Basic
                  </TabsTrigger>
                  <PermissionsWrapper
                    requiredPermissions={[permissions.userManageFinancial]}
                  >
                    <TabsTrigger value="financial" className="h-6 text-[12px]">
                      Financial
                    </TabsTrigger>
                  </PermissionsWrapper>
                </TabsList>

                <TabsContent value="basic" className="m-0 space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[12px]">Name</FormLabel>
                          <FormControl>
                            <Input
                              disabled={!hasUserManagePermission}
                              className="h-9 text-[13px]"
                              {...field}
                            />
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
                      value={
                        currentUser.emailVerified ? "Verified" : "Unverified"
                      }
                    />

                    <FormField
                      control={form.control}
                      name="roleId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[12px]">Role</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              if (!value) return;
                              field.onChange(value);
                            }}
                            disabled={
                              !hasUserManagePermission ||
                              updateUserMutation.isPending
                            }
                          >
                            <FormControl>
                              <SelectTrigger className="h-9 text-[13px]">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem
                                  key={String(role.value)}
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
                                disabled={
                                  !hasUserManagePermission ||
                                  updateUserMutation.isPending
                                }
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
                            disabled={
                              !hasUserManagePermission ||
                              updateUserMutation.isPending
                            }
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
                    <PermissionsWrapper
                      requiredPermissions={[permissions.userManage]}
                    >
                      <Button
                        type="submit"
                        disabled={updateUserMutation.isPending}
                      >
                        {updateUserMutation.isPending
                          ? "Saving..."
                          : "Save changes"}
                      </Button>
                    </PermissionsWrapper>
                  </DialogFooter>
                </TabsContent>

                <PermissionsWrapper
                  requiredPermissions={[permissions.userManageFinancial]}
                >
                  <TabsContent value="financial" className="m-0">
                    <UserFinancialTab
                      userId={currentUser.id}
                      enabled={open && hasFinancialPermission}
                    />
                  </TabsContent>
                </PermissionsWrapper>
              </Tabs>
            </form>
          </Form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function UserFinancialTab({
  userId,
  enabled,
}: {
  userId: string;
  enabled: boolean;
}) {
  const queryClient = useQueryClient();
  const [editingSalary, setEditingSalary] =
    useState<UserSalaryHistoryItem | null>(null);
  const form = useForm<SalaryFormValues>({
    resolver: zodResolver(salaryFormSchema),
    defaultValues: {
      salary: 0,
      effectiveDate: new Date().toISOString().slice(0, 10),
      note: "",
    },
  });

  const financialsQuery = useQuery({
    queryKey: [QUERY_KEYS.USER_FINANCIALS, userId],
    enabled,
    queryFn: async () => {
      const response = await userManageService.getUserFinancials(userId);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch financial data");
      }

      return response.data;
    },
  });

  const saveSalaryMutation = useMutation({
    mutationFn: async (values: SalaryFormValues) => {
      const payload = toSalaryPayload(values);
      const response = editingSalary
        ? await userManageService.updateUserSalary(
            userId,
            editingSalary.id,
            payload
          )
        : await userManageService.createUserSalary(userId, payload);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to save salary");
      }

      return response.data;
    },
    onSuccess: (financials) => {
      toast.success("Salary saved successfully");
      queryClient.setQueryData(
        [QUERY_KEYS.USER_FINANCIALS, userId],
        financials
      );
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USER_FINANCIALS, userId],
      });
      setEditingSalary(null);
      form.reset({
        salary: 0,
        effectiveDate: new Date().toISOString().slice(0, 10),
        note: "",
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  function startEditing(salary: UserSalaryHistoryItem) {
    setEditingSalary(salary);
    form.reset({
      salary: Number(salary.salary),
      effectiveDate: toDateInputValue(salary.effectiveDate),
      note: salary.note ?? "",
    });
  }

  function cancelEditing() {
    setEditingSalary(null);
    form.reset({
      salary: 0,
      effectiveDate: new Date().toISOString().slice(0, 10),
      note: "",
    });
  }

  const financials = financialsQuery.data;

  if (financialsQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
    );
  }

  if (financialsQuery.isError) {
    return <UserDetailError onRetry={() => void financialsQuery.refetch()} />;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-md border bg-muted/20 p-3 sm:grid-cols-4">
        <InfoBlock
          label="Current CTC"
          value={formatSalary(financials?.currentSalary?.salary)}
        />
        <InfoBlock
          label="Current from"
          value={
            financials?.currentSalary
              ? formatDate(financials.currentSalary.effectiveDate)
              : "Not set"
          }
        />
        <InfoBlock
          label="New CTC"
          value={
            financials?.nextSalary
              ? formatSalary(financials.nextSalary.salary)
              : "Not scheduled"
          }
        />
        <InfoBlock
          label="New from"
          value={
            financials?.nextSalary
              ? formatDate(financials.nextSalary.effectiveDate)
              : "Not scheduled"
          }
        />
      </div>

      <div className="grid gap-3 rounded-md border bg-muted/20 p-3 sm:grid-cols-2">
        <InfoBlock
          label="CTC difference"
          value={formatSignedSalary(financials?.analytics.hikeAmount)}
        />
        <InfoBlock
          label="Hike percentage"
          value={formatPercentage(financials?.analytics.hikePercentage)}
        />
      </div>

      <Form {...form}>
        <div className="rounded-md border">
          <div className="grid gap-3 p-3 sm:grid-cols-[1fr_150px]">
            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px]">Salary</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value || ""}
                      type="number"
                      min={0}
                      step="0.01"
                      className="h-8 text-[13px]"
                      disabled={saveSalaryMutation.isPending}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value === ""
                            ? 0
                            : Number(event.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-[12px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="effectiveDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px]">Effective from</FormLabel>
                  <FormControl>
                    <SalaryDatePicker
                      value={field.value}
                      disabled={saveSalaryMutation.isPending}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage className="text-[12px]" />
                </FormItem>
              )}
            />
          </div>

          <div className="border-t p-3">
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px]">Note</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="min-h-20 resize-none text-[13px]"
                      placeholder="Reason for salary change"
                      disabled={saveSalaryMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage className="text-[12px]" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-2 border-t p-3">
            {editingSalary ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-[12px]"
                disabled={saveSalaryMutation.isPending}
                onClick={cancelEditing}
              >
                Cancel edit
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              className="h-8 text-[12px]"
              disabled={saveSalaryMutation.isPending}
              onClick={form.handleSubmit((values) =>
                saveSalaryMutation.mutate(values)
              )}
            >
              {saveSalaryMutation.isPending
                ? "Saving..."
                : editingSalary
                  ? "Update salary"
                  : "Add salary"}
            </Button>
          </div>
        </div>
      </Form>

      <div className="overflow-hidden rounded-md border">
        <div className="grid grid-cols-[1fr_120px_80px] border-b bg-muted/40 px-3 py-2 text-[12px] font-medium">
          <div>Effective from</div>
          <div>CTC</div>
          <div className="text-right">Action</div>
        </div>
        {financials?.salaryHistory.length ? (
          financials.salaryHistory.map((salary) => (
            <div
              key={salary.id}
              className="grid grid-cols-[1fr_120px_80px] items-center border-b px-3 py-2 last:border-b-0"
            >
              <div className="min-w-0">
                <div className="text-[13px] font-medium">
                  {formatDate(salary.effectiveDate)}
                </div>
                <div className="truncate text-[12px] text-muted-foreground">
                  {salary.note || "No note"}
                </div>
              </div>
              <div className="text-[12px] font-medium">
                {formatSalary(salary.salary)}
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[12px]"
                  onClick={() => startEditing(salary)}
                >
                  Edit
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="px-3 py-8 text-center text-[13px] text-muted-foreground">
            No salary history yet
          </div>
        )}
      </div>
    </div>
  );
}

function SalaryDatePicker({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const date = value ? new Date(`${value}T00:00:00`) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-8 w-full justify-start text-left text-[13px] font-normal"
          disabled={disabled}
        >
          <AppIcon name="CalendarDays" className="size-3.5" />
          {date ? format(date, "MMM d, yyyy") : "Select date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selected) => {
            if (!selected) {
              onChange("");
              return;
            }

            onChange(format(selected, "yyyy-MM-dd"));
          }}
        />
      </PopoverContent>
    </Popover>
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
