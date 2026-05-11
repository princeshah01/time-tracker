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

type ProjectSaveDialogProps = {
  open: boolean;
  isPending: boolean;
  mode: "create" | "edit";
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

function ProjectSaveDialog({
  open,
  isPending,
  mode,
  onOpenChange,
  onConfirm,
}: ProjectSaveDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[15px]">
            {mode === "create" ? "Create project" : "Save project changes"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[13px]">
            These changes will be applied to the project record, team
            assignments, billing setup, and related project access.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="h-8 text-[12px]" disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="h-8 text-[12px]"
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {isPending
              ? "Saving..."
              : mode === "create"
                ? "Create project"
                : "Save changes"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { ProjectSaveDialog };
