import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { projectService } from "@/features/project";
import { QUERY_KEYS } from "@/shared/constants";
import type {
  CreateTaskInput,
  TaskDetail,
  UpdateTaskInput,
} from "../task.types";
import { TASK_STATUS_OPTIONS } from "./task-status";

const taskFormSchema = z.object({
  projectId: z.number().int().positive("Project is required"),
  title: z.string().trim().min(2, "Task title is required").max(160),
  description: z.string().max(2000).optional(),
  status: z.enum(["todo", "inprogress", "completed"]),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

type TaskFormProps = {
  task?: TaskDetail | null;
  mode: "create" | "edit";
  canSubmit: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: CreateTaskInput | UpdateTaskInput) => void;
};

function toFormValues(task?: TaskDetail | null): TaskFormValues {
  return {
    projectId: task?.projectId ?? 0,
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? "todo",
  };
}

function TaskForm({
  task,
  mode,
  canSubmit,
  isSubmitting,
  onCancel,
  onSubmit,
}: TaskFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: toFormValues(task),
  });

  const projectsQuery = useQuery({
    queryKey: [QUERY_KEYS.PROJECTS, "task-form-projects"],
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

  function handleSubmit(values: TaskFormValues) {
    const payload = {
      title: values.title.trim(),
      description: values.description?.trim() || null,
      status: values.status,
    };

    if (mode === "create") {
      onSubmit({
        ...payload,
        projectId: values.projectId,
      });
      return;
    }

    onSubmit(payload);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <section className="grid gap-4 border-b p-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[12px]">Project</FormLabel>
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) => field.onChange(Number(value))}
                  disabled={mode === "edit" || isSubmitting}
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[12px]">Status</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="h-8 text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TASK_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-[12px]" />
              </FormItem>
            )}
          />
        </section>

        <section className="space-y-4 border-b p-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[12px]">Task title</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-8 text-[13px]"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage className="text-[12px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[12px]">Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="min-h-28 resize-none text-[13px]"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage className="text-[12px]" />
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
                ? "Create task"
                : "Save changes"}
          </Button>
        </footer>
      </form>
    </Form>
  );
}

export { TaskForm };
