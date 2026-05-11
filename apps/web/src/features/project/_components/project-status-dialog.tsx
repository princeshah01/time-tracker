import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { buttonVariants } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import type { ProjectListItem } from "../project.types";

type ProjectStatusDialogProps = {
  project: ProjectListItem | null;
  open: boolean;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

function ProjectStatusDialog({
  project,
  open,
  isPending,
  onOpenChange,
  onConfirm,
}: ProjectStatusDialogProps) {
  const willDisable = Boolean(project?.isActive);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[15px]">
            {willDisable ? "Disable project" : "Activate project"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[13px]">
            {willDisable
              ? "This project will be marked inactive. Existing records stay available, but new work should not be planned against it."
              : "This project will be restored to the active project list."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {project ? (
          <div className="rounded-md border bg-muted/30 px-3 py-2 text-[13px]">
            <div className="truncate font-medium" title={project.name}>
              {project.name}
            </div>
            <div
              className="truncate text-[12px] text-muted-foreground"
              title={project.clientName}
            >
              {project.clientName}
            </div>
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel className="h-8 text-[12px]" disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              buttonVariants({
                variant: willDisable ? "destructive" : "default",
              }),
              "h-8 text-[12px]"
            )}
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {isPending
              ? "Saving..."
              : willDisable
                ? "Disable project"
                : "Activate project"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { ProjectStatusDialog };
