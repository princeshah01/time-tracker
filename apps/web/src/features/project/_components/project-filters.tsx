import { AppIcon } from "@/shared/components/app-icon";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import type {
  ProjectBillingType,
  ProjectPriority,
  ProjectStatusFilter,
} from "../project.types";

type ProjectFiltersProps = {
  search: string;
  status: ProjectStatusFilter;
  priority: ProjectPriority | "all";
  billingType: ProjectBillingType | "all";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: ProjectStatusFilter) => void;
  onPriorityChange: (value: ProjectPriority | "all") => void;
  onBillingTypeChange: (value: ProjectBillingType | "all") => void;
};

function ProjectFilters({
  search,
  status,
  priority,
  billingType,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onBillingTypeChange,
}: ProjectFiltersProps) {
  return (
    <div className="flex gap-2 flex-row items-center flex-wrap">
      <div className="relative min-w-0 flex-1 lg:max-w-sm">
        <AppIcon
          name="Search"
          className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search project, client, manager..."
          variant="search"
          className="pl-8 text-[13px]"
        />
      </div>

      <Select
        value={status}
        onValueChange={(value) => onStatusChange(value as ProjectStatusFilter)}
      >
        <SelectTrigger className="h-8 text-[12px] lg:w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={priority}
        onValueChange={(value) =>
          onPriorityChange(value as ProjectPriority | "all")
        }
      >
        <SelectTrigger className="h-8 text-[12px] lg:w-36">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={billingType}
        onValueChange={(value) =>
          onBillingTypeChange(value as ProjectBillingType | "all")
        }
      >
        <SelectTrigger className="h-8 text-[12px] lg:w-40">
          <SelectValue placeholder="Billing" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All billing</SelectItem>
          <SelectItem value="fixed_bill">Fixed bill</SelectItem>
          <SelectItem value="hours_worked">Hours worked</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export { ProjectFilters };
