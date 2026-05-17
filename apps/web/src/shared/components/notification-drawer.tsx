import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationSse,
  useNotificationFocusRefresh,
  useNotificationsInfinite,
  useUnreadNotificationCount,
} from "@/features/notifications";
import { AppIcon } from "@/shared/components/app-icon";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { cn } from "@workspace/ui/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type NotificationDrawerProps = {
  className?: string;
};

const ESTIMATED_CARD_HEIGHT = 88;
const ROW_BUFFER = 5;

function NotificationDrawer({ className }: NotificationDrawerProps) {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [limit, setLimit] = useState(20);
  const unreadCountQuery = useUnreadNotificationCount();
  const notificationsQuery = useNotificationsInfinite(limit);
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const unreadCount = unreadCountQuery.data ?? 0;
  const notifications = useMemo(
    () => notificationsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [notificationsQuery.data]
  );

  useNotificationSse();
  useNotificationFocusRefresh();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const calculateLimit = () => {
      setLimit(
        Math.max(
          20,
          Math.ceil(el.clientHeight / ESTIMATED_CARD_HEIGHT) + ROW_BUFFER
        )
      );
    };

    calculateLimit();

    const observer = new ResizeObserver(calculateLimit);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = scrollRef.current;
    if (!sentinel || !root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry?.isIntersecting &&
          notificationsQuery.hasNextPage &&
          !notificationsQuery.isFetchingNextPage
        ) {
          void notificationsQuery.fetchNextPage();
        }
      },
      { root, rootMargin: "120px" }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [notificationsQuery]);

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
          {unreadCount > 0 ? (
            <Badge className="-top-1.5 -right-1.5 absolute flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0 sm:max-w-sm">
        <SheetHeader className="border-b border-border px-4 py-3 pr-10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle className="text-[15px]">Notifications</SheetTitle>
              <SheetDescription className="text-[12px]">
                Recent application updates.
              </SheetDescription>
            </div>
            {unreadCount > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px]"
                disabled={markAllReadMutation.isPending}
                onClick={() => markAllReadMutation.mutate()}
              >
                Mark all read
              </Button>
            ) : null}
          </div>
        </SheetHeader>
        <div ref={scrollRef} className="h-[calc(100vh-73px)] overflow-y-auto">
          {notificationsQuery.isLoading ? (
            <NotificationDrawerMessage>
              Loading notifications...
            </NotificationDrawerMessage>
          ) : notifications.length === 0 ? (
            <NotificationDrawerMessage>
              No notifications yet
            </NotificationDrawerMessage>
          ) : (
            <Accordion type="multiple" className="divide-y divide-border">
              {notifications.map((notification) => (
                <AccordionItem
                  key={notification.id}
                  value={String(notification.id)}
                  className="border-b-0"
                >
                  <AccordionTrigger
                    className="px-4 py-3 text-left hover:no-underline"
                    onClick={() => {
                      if (!notification.isRead) {
                        markReadMutation.mutate(notification.id);
                      }
                    }}
                  >
                    <div className="flex min-w-0 items-start gap-2">
                      <span
                        className={cn(
                          "mt-1.5 size-2 shrink-0 rounded-full",
                          notification.isRead ? "bg-muted" : "bg-primary"
                        )}
                      />
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium">
                          {notification.title}
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                          {formatRelativeTime(notification.createdAt)}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-3">
                    <p className="text-[12px] text-muted-foreground">
                      {notification.description}
                    </p>
                    {notification.href ? (
                      <div className="mt-3 flex justify-end">
                        <Button
                          type="button"
                          size="sm"
                          className="h-7 text-[12px]"
                          onClick={() => navigate(notification.href!)}
                        >
                          View
                        </Button>
                      </div>
                    ) : null}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          <div ref={sentinelRef} className="h-8" />
          {notificationsQuery.isFetchingNextPage ? (
            <div className="px-4 pb-4 text-center text-[12px] text-muted-foreground">
              Loading more...
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function NotificationDrawerMessage({ children }: { children: string }) {
  return (
    <div className="flex min-h-64 items-center justify-center px-4 text-center">
      <p className="text-[13px] text-muted-foreground">{children}</p>
    </div>
  );
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

export { NotificationDrawer };
