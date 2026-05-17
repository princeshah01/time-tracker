import { AppIcon } from "@/shared/components/app-icon";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { cn } from "@workspace/ui/lib/utils";

type NotificationDrawerProps = {
  className?: string;
};

const unreadCount = 0;

function NotificationDrawer({ className }: NotificationDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          noStyle
          className={cn("relative opacity-80 hover:opacity-100", className)}
          aria-label="Open notifications"
        >
          <AppIcon name="Bell" className="size-5" />
          <Badge className="-top-1.5 -right-1.5 absolute flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] leading-none">
            {unreadCount}
          </Badge>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0 sm:max-w-sm">
        <SheetHeader className="border-b border-border px-4 py-3">
          <SheetTitle className="text-[15px]">Notifications</SheetTitle>
          <SheetDescription className="text-[12px]">
            Recent application updates will appear here.
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-64 items-center justify-center px-4 text-center">
          <p className="text-[13px] text-muted-foreground">
            No notifications yet
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { NotificationDrawer };
