import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Calendar } from "@workspace/ui/components/calendar";
import { Checkbox } from "@workspace/ui/components/checkbox";
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
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { type ProjectTeamMember, projectService } from "@/features/project";
import { AppIcon } from "@/shared/components/app-icon";
import { QUERY_KEYS } from "@/shared/constants";
import { formatDate } from "@/shared/lib";
import type {
  CreateTimesheetInput,
  TimesheetListItem,
  UpdateTimesheetInput,
} from "../timesheet.types";

const timesheetFormSchema = z
  .object({
    projectId: z.number().int().positive("Project is required"),
    timesheetName: z.string().trim().min(2, "Timesheet name is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
  })
  .superRefine((value, ctx) => {
    if (
      value.startDate &&
      value.endDate &&
      new Date(value.endDate).getTime() < new Date(value.startDate).getTime()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date must be after start date",
      });
    }
  });

type TimesheetFormValues = z.infer<typeof timesheetFormSchema>;

type TimesheetFormProps = {
  timesheet?: TimesheetListItem | null;
  mode: "create" | "edit" | "view";
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: CreateTimesheetInput | UpdateTimesheetInput) => void;
};

function toDateInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "yyyy-MM-dd");
}

function toDateString(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function toIsoDate(dateString: string) {
  return new Date(`${dateString}T00:00:00.000Z`).toISOString();
}

function toFormValues(
  timesheet?: TimesheetListItem | null
): TimesheetFormValues {
  return {
    projectId: timesheet?.projectId ?? 0,
    timesheetName: timesheet?.timesheetName ?? "",
    startDate: toDateInputValue(timesheet?.startDate),
    endDate: toDateInputValue(timesheet?.endDate),
  };
}

function roleLabel(role: ProjectTeamMember["role"]) {
  if (role === "manager") return "Project manager";
  if (role === "lead") return "Team lead";
  return "Member";
}

function TimesheetForm({
  timesheet,
  mode,
  isSubmitting,
  onCancel,
  onSubmit,
}: TimesheetFormProps) {
  const readOnly = mode === "view";
  const [includedUserIds, setIncludedUserIds] = useState<Set<string>>(
    () => new Set()
  );
  const form = useForm<TimesheetFormValues>({
    resolver: zodResolver(timesheetFormSchema),
    defaultValues: toFormValues(timesheet),
  });
  const projectId = form.watch("projectId");
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");

  const projectsQuery = useQuery({
    queryKey: [QUERY_KEYS.PROJECTS, "timesheet-form-projects"],
    queryFn: async () => {
      const response = await projectService.listProjects({
        page: 1,
        limit: 100,
        status: "active",
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch projects");
      }

      return response.data.items;
    },
  });

  const projectQuery = useQuery({
    queryKey: [QUERY_KEYS.PROJECT_DETAIL, projectId],
    enabled: projectId > 0,
    queryFn: async () => {
      const response = await projectService.viewProject(projectId);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch project");
      }

      return response.data;
    },
  });

  const teamMembers = projectQuery.data?.teamMembers ?? [];
  const selectedRange = useMemo(() => {
    if (!startDate) return undefined;

    return {
      from: new Date(`${startDate}T00:00:00`),
      to: endDate ? new Date(`${endDate}T00:00:00`) : undefined,
    };
  }, [endDate, startDate]);
  const includedCount = includedUserIds.size;
  const allIncluded =
    teamMembers.length > 0 && includedCount === teamMembers.length;

  useEffect(() => {
    form.reset(toFormValues(timesheet));
  }, [form, timesheet]);

  useEffect(() => {
    if (!projectQuery.data) {
      setIncludedUserIds(new Set());
      return;
    }

    const timesheetProjectSelected =
      timesheet && projectId === timesheet.projectId;

    if (mode !== "create" && timesheetProjectSelected) {
      setIncludedUserIds(new Set(timesheet.users.map((user) => user.id)));
      return;
    }

    setIncludedUserIds(
      new Set(projectQuery.data.teamMembers.map((member) => member.userId))
    );
  }, [mode, projectId, projectQuery.data, timesheet]);

  function toggleUser(userId: string, checked: boolean) {
    setIncludedUserIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(userId);
      } else {
        next.delete(userId);
      }
      return next;
    });
  }

  function toggleAll(checked: boolean) {
    setIncludedUserIds(
      checked ? new Set(teamMembers.map((member) => member.userId)) : new Set()
    );
  }

  function handleSubmit(values: TimesheetFormValues) {
    const payload = {
      projectId: values.projectId,
      timesheetName: values.timesheetName.trim(),
      startDate: toIsoDate(values.startDate),
      endDate: toIsoDate(values.endDate),
      userIds: Array.from(includedUserIds),
    };

    onSubmit(payload);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <section className="grid gap-4 border-y p-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid content-start gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px]">Project</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : ""}
                    disabled={readOnly || isSubmitting}
                    onValueChange={(value) => {
                      field.onChange(Number(value));
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="h-8 text-[13px]">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(projectsQuery.data ?? []).map((project) => (
                        <SelectItem key={project.id} value={String(project.id)}>
                          {project.name}
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
              name="timesheetName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px]">Timesheet name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="E.g. Sprint 1, Week of Sep 1, etc."
                      className="h-8 text-[13px]"
                      disabled={readOnly || isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-[12px]" />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            {readOnly ? (
              <div className="space-y-2">
                <FormLabel className="text-[12px]">Date range</FormLabel>
                <div className="flex h-8 items-center rounded-md border border-border px-3 text-[13px]">
                  {formatDate(startDate)} - {formatDate(endDate)}
                </div>
              </div>
            ) : (
              <DateRangeField
                value={selectedRange}
                disabled={isSubmitting}
                onChange={(range) => {
                  form.setValue(
                    "startDate",
                    range?.from ? toDateString(range.from) : "",
                    { shouldDirty: true, shouldValidate: true }
                  );
                  form.setValue(
                    "endDate",
                    range?.to ? toDateString(range.to) : "",
                    {
                      shouldDirty: true,
                      shouldValidate: true,
                    }
                  );
                }}
              />
            )}
            <div className="grid gap-1 text-[11px] text-muted-foreground sm:grid-cols-2">
              <span>Start: {startDate ? formatDate(startDate) : "-"}</span>
              <span>End: {endDate ? formatDate(endDate) : "-"}</span>
            </div>
            {form.formState.errors.startDate?.message ||
            form.formState.errors.endDate?.message ? (
              <p className="text-[12px] font-medium text-destructive">
                {form.formState.errors.startDate?.message ||
                  form.formState.errors.endDate?.message}
              </p>
            ) : null}
          </div>
        </section>

        <section className="space-y-3 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[13px] font-medium">Project members</h2>
              <p className="text-[12px] text-muted-foreground">
                {projectId
                  ? `${includedCount} of ${teamMembers.length} included`
                  : "Select a project to load members"}
              </p>
            </div>
            {teamMembers.length > 0 && !readOnly ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-[12px]"
                disabled={isSubmitting}
                onClick={() => toggleAll(!allIncluded)}
              >
                {allIncluded ? "Disable all" : "Enable all"}
              </Button>
            ) : null}
          </div>

          <TimesheetMemberTable
            members={teamMembers}
            includedUserIds={includedUserIds}
            isLoading={projectQuery.isLoading}
            disabled={readOnly || isSubmitting}
            onToggleUser={toggleUser}
          />
        </section>

        {mode !== "view" ? (
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
              disabled={isSubmitting || includedUserIds.size === 0}
            >
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                  ? "Create timesheet"
                  : "Save changes"}
            </Button>
          </footer>
        ) : null}
      </form>
    </Form>
  );
}

function DateRangeField({
  value,
  disabled,
  onChange,
}: {
  value?: { from: Date; to?: Date };
  disabled?: boolean;
  onChange: (value?: { from?: Date; to?: Date }) => void;
}) {
  return (
    <div className="space-y-2">
      <FormLabel className="text-[12px]">Date range</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-8 w-full justify-start text-left text-[13px] font-normal"
            disabled={disabled}
          >
            <AppIcon name="CalendarDays" className="size-3.5" />
            {value?.from ? (
              value.to ? (
                <>
                  {formatDate(value.from)} - {formatDate(value.to)}
                </>
              ) : (
                `${formatDate(value.from)} - Select end date`
              )
            ) : (
              "Select date range"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={value}
            onSelect={onChange}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function TimesheetMemberTable({
  members,
  includedUserIds,
  isLoading,
  disabled,
  onToggleUser,
}: {
  members: ProjectTeamMember[];
  includedUserIds: Set<string>;
  isLoading: boolean;
  disabled?: boolean;
  onToggleUser: (userId: string, checked: boolean) => void;
}) {
  return (
    <div className="overflow-hidden rounded-md border">
      <div className="grid grid-cols-[44px_minmax(0,1fr)_140px] border-b bg-muted/40 px-3 py-2 text-[12px] font-medium">
        <div />
        <div>User</div>
        <div>Role</div>
      </div>

      {isLoading ? (
        <div className="px-3 py-8 text-center text-[13px] text-muted-foreground">
          Loading project members...
        </div>
      ) : members.length > 0 ? (
        members.map((member) => {
          const checked = includedUserIds.has(member.userId);

          return (
            <div
              key={member.userId}
              className="grid grid-cols-[44px_minmax(0,1fr)_140px] items-center border-b bg-background px-3 py-2 last:border-b-0"
            >
              <Checkbox
                checked={checked}
                disabled={disabled}
                onCheckedChange={(value) =>
                  onToggleUser(member.userId, Boolean(value))
                }
                aria-label={`Include ${member.user.name}`}
              />
              <div className="min-w-0">
                <div
                  className="truncate text-[13px] font-medium"
                  title={member.user.name}
                >
                  {member.user.name}
                </div>
                <div
                  className="truncate text-[12px] text-muted-foreground"
                  title={member.user.email}
                >
                  {member.user.email}
                </div>
              </div>
              <Badge variant="outline" className="w-fit rounded-md text-[10px]">
                {roleLabel(member.role)}
              </Badge>
            </div>
          );
        })
      ) : (
        <div className="px-3 py-8 text-center text-[13px] text-muted-foreground">
          No project members found
        </div>
      )}
    </div>
  );
}

export { TimesheetForm };
