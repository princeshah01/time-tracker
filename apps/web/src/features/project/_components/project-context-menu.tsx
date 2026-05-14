import { AppIcon } from "@/shared/components/app-icon";
import { useDismiss } from "@/shared/hooks/use-dismiss";
import type { ProjectListItem, ProjectMenuState } from "../project.types";

type ProjectContextMenuProps = {
  menuState: ProjectMenuState;
  canManage: boolean;
  setMenuState: (state: ProjectMenuState) => void;
  onView: (project: ProjectListItem) => void;
  onEdit: (project: ProjectListItem) => void;
  onToggleStatus: (project: ProjectListItem) => void;
};

function ProjectContextMenu({
  menuState,
  canManage,
  setMenuState,
  onView,
  onEdit,
  onToggleStatus,
}: ProjectContextMenuProps) {
  const menuRef = useDismiss<HTMLDivElement>({
    enabled: Boolean(menuState),
    onDismiss: () => setMenuState(null),
  });

  if (!menuState) return null;

  const project = menuState.row;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-48 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      style={{ top: menuState.y, left: menuState.x }}
    >
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-[13px] hover:bg-accent"
        onClick={() => {
          onView(project);
          setMenuState(null);
        }}
      >
        <AppIcon name="Eye" className="size-3.5" />
        View project
      </button>

     {canManage && (
      <>
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-[13px] hover:bg-accent disabled:opacity-50"
        disabled={!canManage}
        onClick={() => {
          onEdit(project);
          setMenuState(null);
        }}
      >
        <AppIcon name="Pencil" className="size-3.5" />
        Edit project
      </button>

      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-[13px] hover:bg-accent disabled:opacity-50"
        disabled={!canManage}
        onClick={() => {
          onToggleStatus(project);
          setMenuState(null);
        }}
      >
        <AppIcon
          name={project.isActive ? "CircleOff" : "CheckCircle2"}
          className="size-3.5"
        />
        {project.isActive ? "Disable project" : "Activate project"}
      </button>
      </>
      )}
    </div>
  );
}

export { ProjectContextMenu };
