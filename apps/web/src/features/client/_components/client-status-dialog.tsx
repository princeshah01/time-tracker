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
import type { ClientListItem } from "../client.types";

type ClientStatusDialogProps = {
  client: ClientListItem | null;
  open: boolean;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

function ClientStatusDialog({
  client,
  open,
  isPending,
  onOpenChange,
  onConfirm,
}: ClientStatusDialogProps) {
  const willDisable = Boolean(client?.isActive);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[15px]">
            {willDisable ? "Disable client" : "Activate client"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[13px]">
            {willDisable
              ? "This client will be marked inactive. Existing records stay available, but the client will be filtered out of active lists."
              : "This client will be restored to the active client list."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {client ? (
          <div className="rounded-md border bg-muted/30 px-3 py-2 text-[13px]">
            <div className="truncate font-medium" title={client.name}>
              {client.name}
            </div>
            <div
              className="truncate text-[12px] text-muted-foreground"
              title={client.company ?? client.email}
            >
              {client.company ?? client.email}
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
                ? "Disable client"
                : "Activate client"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { ClientStatusDialog };
