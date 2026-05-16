import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

import { AppIcon } from "@/shared/components/app-icon";
import type { ProjectListItem } from "../project.types";

function ProjectIdentityCell({ project }: { project: ProjectListItem }) {
  return (
    <div className="min-w-0">
      <span className="block truncate font-medium" title={project.name}>
        #{project.id} {project.name}
      </span>
      <span
        className="block truncate text-[12px] text-muted-foreground"
        title={project.clientName}
      >
        {project.clientName}
      </span>
    </div>
  );
}

function ProjectStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md text-[10px]",
        isActive
          ? "border-success bg-success/10 text-success"
          : "border-muted bg-muted text-muted-foreground"
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

function ProjectManagerCell({ project }: { project: ProjectListItem }) {
  return (
    <div className="min-w-0">
      <span
        className="block truncate text-[13px] font-medium"
        title={project.manager?.name ?? "-"}
      >
        {project.manager?.name ?? "-"}
      </span>
      <span
        className="block truncate text-[12px] text-muted-foreground"
        title={project.manager?.email ?? "-"}
      >
        {project.manager?.email ?? "-"}
      </span>
    </div>
  );
}

function ProjectActionsCell({
  project,
  canManage,
  onView,
  onEdit,
  onToggleStatus,
}: {
  project: ProjectListItem;
  canManage: boolean;
  onView: (project: ProjectListItem) => void;
  onEdit: (project: ProjectListItem) => void;
  onToggleStatus: (project: ProjectListItem) => void;
}) {
  return (
    <div className="flex items-center gap-px">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 text-muted-foreground"
        title="View project"
        aria-label="View project"
        onClick={(event) => {
          event.stopPropagation();
          onView(project);
        }}
      >
        <AppIcon name="Eye" className="size-3.5" />
      </Button>
      {canManage && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground"
            title="Edit project"
            aria-label="Edit project"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(project);
            }}
          >
            <AppIcon name="Pencil" className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground"
            disabled={!canManage}
            title={project.isActive ? "Disable project" : "Activate project"}
            aria-label={
              project.isActive ? "Disable project" : "Activate project"
            }
            onClick={(event) => {
              event.stopPropagation();
              onToggleStatus(project);
            }}
          >
            <AppIcon
              name={project.isActive ? "CircleOff" : "CheckCircle2"}
              className="size-3.5"
            />
          </Button>
        </>
      )}
    </div>
  );
}

export {
  ProjectActionsCell,
  ProjectIdentityCell,
  ProjectManagerCell,
  ProjectStatusBadge,
};
