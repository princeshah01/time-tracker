import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";

import type { TaskStatus } from "../task.types";

const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "Todo" },
  { value: "inprogress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

function taskStatusLabel(status: TaskStatus) {
  return (
    TASK_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status
  );
}

function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "w-fit rounded-md text-[10px]",
        status === "todo" && "border-muted bg-muted/40 text-muted-foreground",
        status === "inprogress" && "border-info bg-info/10 text-info",
        status === "completed" && "border-success bg-success/10 text-success"
      )}
    >
      {taskStatusLabel(status)}
    </Badge>
  );
}

export { TASK_STATUS_OPTIONS, TaskStatusBadge, taskStatusLabel };
