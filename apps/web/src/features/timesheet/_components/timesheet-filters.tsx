import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import type { ReactNode } from "react";

import type { ProjectListItem } from "@/features/project";
import { AppIcon } from "@/shared/components/app-icon";

const ALL_PROJECTS = "all";

type TimesheetFiltersProps = {
  search: string;
  selectedProjectId: number | null;
  projects: ProjectListItem[];
  isLoadingProjects?: boolean;
  actions?: ReactNode;
  onSearchChange: (value: string) => void;
  onProjectChange: (value: number | null) => void;
};

function TimesheetFilters({
  search,
  selectedProjectId,
  projects,
  isLoadingProjects,
  actions,
  onSearchChange,
  onProjectChange,
}: TimesheetFiltersProps) {

  return (
    <div className="flex w-full flex-col justify-between gap-2 sm:flex-row sm:items-center">
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
            placeholder="Search timesheet"
            className="h-8 pl-8 text-[13px]"
          />
        </div>

        <Select
          value={selectedProjectId ? String(selectedProjectId) : ALL_PROJECTS}
          disabled={isLoadingProjects}
          onValueChange={(value) =>
            onProjectChange(value === ALL_PROJECTS ? null : Number(value))
          }
        >
          <SelectTrigger className="h-8 w-full gap-2 text-[13px] sm:max-w-64">
            <SelectValue
              placeholder={isLoadingProjects ? "Loading projects" : "Project"}
            />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectItem value={ALL_PROJECTS}>All projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={String(project.id)}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

export { TimesheetFilters };
