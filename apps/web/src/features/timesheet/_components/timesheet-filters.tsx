import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import type { ReactNode } from "react";

import { AppIcon } from "@/shared/components/app-icon";

type TimesheetFiltersProps = {
  search: string;
  projectName: string;
  actions?: ReactNode;
  onSearchChange: (value: string) => void;
  onProjectNameChange: (value: string) => void;
  onClear: () => void;
};

function TimesheetFilters({
  search,
  projectName,
  actions,
  onSearchChange,
  onProjectNameChange,
  onClear,
}: TimesheetFiltersProps) {
  const hasFilters = search.trim().length > 0 || projectName.trim().length > 0;

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
            placeholder="Search timesheet, creator..."
            className="h-8 pl-8 text-[13px]"
          />
        </div>

        <div className="relative w-full sm:max-w-56">
          <AppIcon
            name="FolderKanban"
            className="-translate-y-1/2 absolute top-1/2 left-2.5 size-3.5 text-muted-foreground"
          />
          <Input
            value={projectName}
            variant="search"
            onChange={(event) => onProjectNameChange(event.target.value)}
            placeholder="Project name"
            className="h-8 pl-8 text-[13px]"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-[12px]"
          disabled={!hasFilters}
          onClick={onClear}
        >
          <AppIcon name="X" className="size-3.5" />
          Clear
        </Button>
      </div>

      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

export { TimesheetFilters };
