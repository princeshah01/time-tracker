import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AppIcon } from "@/shared/components/app-icon";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Calendar } from "@workspace/ui/components/calendar";
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
import { Switch } from "@workspace/ui/components/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Textarea } from "@workspace/ui/components/textarea";
import type {
  CreateProjectInput,
  ProjectDetail,
  ProjectTeamRole,
  UpdateProjectBillingInput,
  UpdateProjectInput,
} from "../project.types";
import { ClientCombobox } from "./client-combobox";
import { UserCombobox, type UserOption } from "./user-combobox";

const teamRowSchema = z.object({
  rowId: z.string().min(1),
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string(),
  role: z.enum(["manager", "lead", "member"]),
});

const projectFormSchema = z
  .object({
    name: z.string().trim().min(2, "Project name is required").max(160),
    clientId: z.number().int().positive("Client is required"),
    clientLabel: z.string().trim().min(1, "Client is required"),
    priority: z.enum(["low", "medium", "high", "urgent"]),
    description: z.string().max(2000).optional(),
    isActive: z.boolean(),
    startDate: z.string().min(1, "Start date is required"),
    expectedEndDate: z.string().optional(),
    billingType: z.enum(["fixed_bill", "hours_worked"]),
    totalProjectIncome: z.number().nonnegative().nullable().optional(),
    teamRows: z.array(teamRowSchema),
    billingRates: z.record(z.string(), z.number().nonnegative().nullable()),
  })
  .superRefine((value, ctx) => {
    const managerCount = value.teamRows.filter(
      (row) => row.role === "manager"
    ).length;

    if (managerCount > 1) {
      ctx.addIssue({
        code: "custom",
        path: ["teamRows"],
        message: "Only one project manager can be assigned",
      });
    }
  });

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
type ProjectFormTab = "basic" | "team" | "billing";

type ProjectFormProps = {
  project?: ProjectDetail | null;
  mode: "create" | "edit" | "view";
  canSubmit: boolean;
  canManageFinance: boolean;
  isSubmitting: boolean;
  isBillingSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (input: CreateProjectInput | UpdateProjectInput) => void;
  onBillingSubmit?: (input: UpdateProjectBillingInput) => void;
};

const EMPTY_ROWS = [
  { rowId: "manager", role: "manager" as const },
  { rowId: "lead", role: "lead" as const },
  { rowId: "member-1", role: "member" as const },
];

function createEmptyRow(rowId: string, role: ProjectTeamRole) {
  return {
    rowId,
    userId: "",
    userName: "",
    userEmail: "",
    role,
  };
}

function toDateInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function toFormValues(project?: ProjectDetail | null): ProjectFormValues {
  const existingRows =
    project?.teamMembers.map((member, index) => ({
      rowId: `${member.role}-${member.userId}-${index}`,
      userId: member.userId,
      userName: member.user.name,
      userEmail: member.user.email,
      role: member.role,
    })) ?? [];

  const teamRows =
    existingRows.length > 0
      ? existingRows
      : EMPTY_ROWS.map((row) => createEmptyRow(row.rowId, row.role));

  return {
    name: project?.name ?? "",
    clientId: project?.client?.id ?? 0,
    clientLabel: project?.client?.name ?? "",
    priority: project?.priority ?? "medium",
    description: project?.description ?? "",
    isActive: project?.isActive ?? true,
    startDate: toDateInputValue(project?.startDate),
    expectedEndDate: toDateInputValue(project?.expectedEndDate),
    billingType: project?.billingType ?? "hours_worked",
    totalProjectIncome: project?.totalProjectIncome
      ? Number(project.totalProjectIncome)
      : null,
    teamRows,
    billingRates: Object.fromEntries(
      project?.teamMembers.map((member) => [
        member.userId,
        member.hourlyRate ? Number(member.hourlyRate) : null,
      ]) ?? []
    ),
  };
}

function selectedTeamMembers(values: ProjectFormValues) {
  return values.teamRows
    .filter((row) => row.userId)
    .map((row) => ({
      userId: row.userId,
      role: row.role,
    }));
}

function toProjectPayload(values: ProjectFormValues): CreateProjectInput {
  return {
    name: values.name.trim(),
    clientId: values.clientId,
    priority: values.priority,
    description: values.description?.trim() || null,
    isActive: values.isActive,
    startDate: values.startDate,
    expectedEndDate: values.expectedEndDate || null,
    billingType: values.billingType,
    teamMembers: selectedTeamMembers(values),
  };
}

function toBillingPayload(
  values: ProjectFormValues,
  billingUserIds?: string[]
): UpdateProjectBillingInput {
  if (values.billingType === "fixed_bill") {
    return {
      totalProjectIncome: values.totalProjectIncome ?? null,
    };
  }

  const userIds =
    billingUserIds ?? selectedTeamMembers(values).map((member) => member.userId);

  return {
    teamMembers: userIds.map((userId) => ({
      userId,
      hourlyRate: values.billingRates[userId] ?? null,
    })),
  };
}

function formatMoney(value?: number | null) {
  if (value === undefined || value === null) return "Not set";

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}

function roleLabel(role: ProjectTeamRole) {
  if (role === "manager") return "Project manager";
  if (role === "lead") return "Team lead";
  return "Member";
}

function ProjectForm({
  project,
  mode,
  canSubmit,
  canManageFinance,
  isSubmitting,
  isBillingSubmitting = false,
  onCancel,
  onSubmit,
  onBillingSubmit,
}: ProjectFormProps) {
  const readOnly = mode === "view";
  const projectReadOnly = readOnly || !canSubmit;
  const billingReadOnly = readOnly || !canManageFinance;
  const [activeTab, setActiveTab] = useState<ProjectFormTab>("basic");
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: toFormValues(project),
  });
  const teamRows = form.watch("teamRows");
  const billingType = form.watch("billingType");
  const selectedUserIds = useMemo(
    () => teamRows.map((row) => row.userId).filter(Boolean),
    [teamRows]
  );
  const persistedTeamUserIds = useMemo(
    () => new Set(project?.teamMembers.map((member) => member.userId) ?? []),
    [project?.teamMembers]
  );
  const billingRows = useMemo(
    () =>
      project?.teamMembers.map((member, index) => ({
        rowId: `${member.role}-${member.userId}-${index}`,
        userId: member.userId,
        userName: member.user.name,
        userEmail: member.user.email,
        role: member.role,
      })) ?? [],
    [project?.teamMembers]
  );

  useEffect(() => {
    form.reset(toFormValues(project));
  }, [form, project]);

  function updateRow(
    rowId: string,
    patch: Partial<ProjectFormValues["teamRows"][number]>
  ) {
    form.setValue(
      "teamRows",
      teamRows.map((row) =>
        row.rowId === rowId
          ? {
              ...row,
              ...patch,
            }
          : row
      ),
      { shouldDirty: true, shouldValidate: true }
    );
  }

  function selectUser(rowId: string, user: UserOption) {
    updateRow(rowId, {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
    });
  }

  function changeRowRole(rowId: string, role: ProjectTeamRole) {
    updateRow(rowId, {
      role,
      userId: "",
      userName: "",
      userEmail: "",
    });
  }

  function addRow() {
    form.setValue(
      "teamRows",
      [...teamRows, createEmptyRow(`member-${Date.now()}`, "member")],
      { shouldDirty: true, shouldValidate: true }
    );
  }

  function removeRow(rowId: string) {
    const row = teamRows.find((item) => item.rowId === rowId);
    form.setValue(
      "teamRows",
      teamRows.filter((item) => item.rowId !== rowId),
      { shouldDirty: true, shouldValidate: true }
    );

    if (row?.userId && !persistedTeamUserIds.has(row.userId)) {
      const nextRates = { ...form.getValues("billingRates") };
      delete nextRates[row.userId];
      form.setValue("billingRates", nextRates, { shouldDirty: true });
    }
  }

  function updateBillingRate(userId: string, value: string) {
    form.setValue(
      "billingRates",
      {
        ...form.getValues("billingRates"),
        [userId]: value === "" ? null : Number(value),
      },
      { shouldDirty: true, shouldValidate: true }
    );
  }

  function handleSubmit(values: ProjectFormValues) {
    if (projectReadOnly) return;
    onSubmit(toProjectPayload(values));
  }

  function handleBillingSubmit() {
    if (!onBillingSubmit) return;
    onBillingSubmit(
      toBillingPayload(
        form.getValues(),
        billingRows.map((row) => row.userId)
      )
    );
  }

  const isHourlyBilling = billingType === "hours_worked";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as ProjectFormTab)}
          className="min-h-0"
        >
          <div className="border-b px-4 py-2">
            <TabsList className="h-8 rounded-md bg-muted/40 p-1">
              <TabsTrigger value="basic" className="h-6 text-[12px]">
                Basic info
              </TabsTrigger>
              <TabsTrigger value="team" className="h-6 text-[12px]">
                Team
              </TabsTrigger>
              {canManageFinance && project ? (
                <TabsTrigger value="billing" className="h-6 text-[12px]">
                  Billing
                </TabsTrigger>
              ) : null}
            </TabsList>
          </div>

          <TabsContent value="basic" className="m-0 divide-y divide-border">
            <section className="grid gap-4 p-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px]">Project name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-8 text-[13px]"
                        disabled={projectReadOnly || isSubmitting}
                      />
                    </FormControl>
                    <FormMessage className="text-[12px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientId"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-[12px]">Client</FormLabel>
                    <ClientCombobox
                      value={form.watch("clientId") || null}
                      label={form.watch("clientLabel")}
                      disabled={projectReadOnly || isSubmitting}
                      onChange={(client) => {
                        form.setValue("clientId", client?.value ?? 0, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                        form.setValue("clientLabel", client?.label ?? "", {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                    />
                    <FormMessage className="text-[12px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px]">Priority</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={projectReadOnly || isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="h-8 text-[13px]">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[12px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px]">Billing type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={projectReadOnly || isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="h-8 text-[13px]">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fixed_bill">Fixed bill</SelectItem>
                        <SelectItem value="hours_worked">
                          Hours worked
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[12px]" />
                  </FormItem>
                )}
              />

              <DateField
                label="Start date"
                value={form.watch("startDate")}
                disabled={projectReadOnly || isSubmitting}
                onChange={(value) =>
                  form.setValue("startDate", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />

              <DateField
                label="Expected end date"
                value={form.watch("expectedEndDate") ?? ""}
                disabled={projectReadOnly || isSubmitting}
                onChange={(value) =>
                  form.setValue("expectedEndDate", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px]">Status</FormLabel>
                    <div className="flex h-8 items-center justify-between rounded-md border px-3">
                      <span className="text-[13px]">
                        {field.value ? "Active" : "Inactive"}
                      </span>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={projectReadOnly || isSubmitting}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-[12px]" />
                  </FormItem>
                )}
              />
            </section>

            <section className="p-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px]">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="min-h-24 resize-none text-[13px]"
                        disabled={projectReadOnly || isSubmitting}
                      />
                    </FormControl>
                    <FormMessage className="text-[12px]" />
                  </FormItem>
                )}
              />
            </section>
          </TabsContent>

          <TabsContent value="team" className="m-0">
            <section className="p-4">
              <TeamTable
                rows={teamRows}
                selectedUserIds={selectedUserIds}
                disabled={projectReadOnly || isSubmitting}
                onAddRow={addRow}
                onRemoveRow={removeRow}
                onRoleChange={changeRowRole}
                onUserSelect={selectUser}
              />
              {form.formState.errors.teamRows?.message ? (
                <p className="mt-2 text-[12px] text-destructive">
                  {form.formState.errors.teamRows.message}
                </p>
              ) : null}
            </section>
          </TabsContent>

          {canManageFinance && project ? (
            <TabsContent value="billing" className="m-0">
              <section className="space-y-4 p-4">
                {billingType === "fixed_bill" ? (
                  <FormField
                    control={form.control}
                    name="totalProjectIncome"
                    render={({ field }) => (
                      <FormItem className="max-w-sm">
                        <FormLabel className="text-[12px]">
                          Total project income
                        </FormLabel>
                        <FormControl>
                          <Input
                            value={field.value ?? ""}
                            type="number"
                            min={0}
                            step="0.01"
                            className="h-8 text-[13px]"
                            disabled={billingReadOnly || isBillingSubmitting}
                            onChange={(event) =>
                              field.onChange(
                                event.target.value === ""
                                  ? null
                                  : Number(event.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage className="text-[12px]" />
                      </FormItem>
                    )}
                  />
                ) : null}

                <div className="overflow-hidden rounded-md border">
                  <div
                    className={
                      isHourlyBilling
                        ? "grid grid-cols-[1fr_140px_140px] border-b bg-muted/40 px-3 py-2 text-[12px] font-medium"
                        : "grid grid-cols-[1fr_140px] border-b bg-muted/40 px-3 py-2 text-[12px] font-medium"
                    }
                  >
                    <div>Member</div>
                    <div>Role</div>
                    {isHourlyBilling ? <div>Rate/hr</div> : null}
                  </div>

                  {billingRows.length > 0 ? (
                    billingRows.map((row) => (
                      <div
                        key={row.rowId}
                        className={
                          isHourlyBilling
                            ? "grid grid-cols-[1fr_140px_140px] items-center border-b px-3 py-2 last:border-b-0"
                            : "grid grid-cols-[1fr_140px] items-center border-b px-3 py-2 last:border-b-0"
                        }
                      >
                        <div className="min-w-0">
                          <div
                            className="truncate text-[13px] font-medium"
                            title={row.userName}
                          >
                            {row.userName}
                          </div>
                          <div
                            className="truncate text-[12px] text-muted-foreground"
                            title={row.userEmail}
                          >
                            {row.userEmail}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="w-fit rounded-md text-[10px]"
                        >
                          {roleLabel(row.role)}
                        </Badge>
                        {isHourlyBilling ? (
                          readOnly ? (
                            <div className="text-[12px] font-medium">
                              {formatMoney(
                                form.watch("billingRates")[row.userId]
                              )}
                            </div>
                          ) : (
                            <Input
                              value={
                                form.watch("billingRates")[row.userId] ?? ""
                              }
                              type="number"
                              min={0}
                              step="0.01"
                              className="h-8 text-[12px]"
                              disabled={billingReadOnly || isBillingSubmitting}
                              onChange={(event) =>
                                updateBillingRate(
                                  row.userId,
                                  event.target.value
                                )
                              }
                            />
                          )
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-8 text-center text-[13px] text-muted-foreground">
                      Save team members before setting billing rates
                    </div>
                  )}
                </div>

                {!billingReadOnly ? (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 text-[12px]"
                      disabled={isBillingSubmitting}
                      onClick={handleBillingSubmit}
                    >
                      {isBillingSubmitting ? "Saving..." : "Save billing"}
                    </Button>
                  </div>
                ) : null}
              </section>
            </TabsContent>
          ) : null}
        </Tabs>

        {mode !== "view" && activeTab !== "billing" ? (
          <footer className="flex justify-end gap-2 border-t p-4">
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
                  ? "Create project"
                  : "Save changes"}
            </Button>
          </footer>
        ) : null}
      </form>
    </Form>
  );
}

function DateField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const date = value ? new Date(`${value}T00:00:00`) : undefined;

  return (
    <div className="space-y-2">
      <FormLabel className="text-[12px]">{label}</FormLabel>
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
    </div>
  );
}

function TeamTable({
  rows,
  selectedUserIds,
  disabled,
  onAddRow,
  onRemoveRow,
  onRoleChange,
  onUserSelect,
}: {
  rows: ProjectFormValues["teamRows"];
  selectedUserIds: string[];
  disabled?: boolean;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onRoleChange: (rowId: string, role: ProjectTeamRole) => void;
  onUserSelect: (rowId: string, user: UserOption) => void;
}) {
  return (
    <div className="relative h-fit overflow-visible rounded-md border">
      <div className="grid grid-cols-[150px_1fr_40px] rounded-t-md border-b bg-muted/40 px-3 py-2 text-[12px] font-medium md:grid-cols-[170px_1fr_48px]">
        <div>Role</div>
        <div>User</div>
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            disabled={disabled}
            onClick={onAddRow}
          >
            <AppIcon name="Plus" className="size-3.5" />
          </Button>
        </div>
      </div>

      {rows.map((row) => (
        <div
          key={row.rowId}
          className="relative grid grid-cols-[150px_1fr_40px] items-start gap-2 border-b bg-background px-3 py-2 last:rounded-b-md last:border-b-0 focus-within:z-30 md:grid-cols-[170px_1fr_48px]"
        >
          <Select
            value={row.role}
            onValueChange={(value) =>
              onRoleChange(row.rowId, value as ProjectTeamRole)
            }
            disabled={disabled}
          >
            <SelectTrigger className="h-8 text-[12px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="manager"
                disabled={rows.some(
                  (item) => item.role === "manager" && item.rowId !== row.rowId
                )}
              >
                Project manager
              </SelectItem>
              <SelectItem value="lead">Team lead</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>

          <div className="min-w-0">
            <UserCombobox
              value={row.userName}
              role={row.role}
              disabled={disabled}
              excludeUserIds={selectedUserIds.filter((id) => id !== row.userId)}
              placeholder={`Search ${roleLabel(row.role).toLowerCase()}`}
              onSelect={(user) => onUserSelect(row.rowId, user)}
            />
            {row.userEmail ? (
              <div className="mt-1 truncate text-[11px] text-muted-foreground">
                {row.userEmail}
              </div>
            ) : null}
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={disabled || rows.length <= 1}
              onClick={() => onRemoveRow(row.rowId)}
            >
              <AppIcon name="X" className="size-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export { ProjectForm };
