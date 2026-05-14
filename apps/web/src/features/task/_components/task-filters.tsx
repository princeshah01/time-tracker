import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

import { AppIcon } from "@/shared/components/app-icon";
import type { TaskStatusFilter } from "../task.types";
import { TASK_STATUS_OPTIONS } from "./task-status";

type TaskFiltersProps = {
  search: string;
  status: TaskStatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: TaskStatusFilter) => void;
};

function TaskFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: TaskFiltersProps) {
  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative w-full sm:max-w-xs">
        <AppIcon
          name="Search"
          className="-translate-y-1/2 absolute top-1/2 left-2.5 size-3.5 text-muted-foreground"
        />
        <Input
          value={search}
          variant="search"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search task, project, creator..."
          className="h-8 pl-8 text-[13px]"
        />
      </div>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="h-8 w-full text-[12px] sm:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All status</SelectItem>
          {TASK_STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export { TaskFilters };
