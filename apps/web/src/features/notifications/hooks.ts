import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "@workspace/ui/components/sonner";
import { useEffect } from "react";

import { env } from "@/shared/config";
import { QUERY_KEYS } from "@/shared/constants";
import type {
  AppNotification,
  ListNotificationsResponse,
} from "./notifications.types";
import { notificationsService } from "./service";

export function useNotificationsInfinite(limit: number) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS, limit],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const response = await notificationsService.listNotifications({
        limit,
        cursor: pageParam,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch notifications");
      }

      return response.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATION_UNREAD_COUNT],
    queryFn: async () => {
      const response = await notificationsService.getUnreadCount();

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Failed to fetch unread notification count"
        );
      }

      return response.data.count;
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationsService.markNotificationRead(id),
    onSuccess: (response) => {
      if (!response.success || !response.data) return;

      updateNotificationInCache(queryClient, response.data);
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.NOTIFICATION_UNREAD_COUNT],
      });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsService.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.setQueriesData<InfiniteData<ListNotificationsResponse>>(
        { queryKey: [QUERY_KEYS.NOTIFICATIONS] },
        (data) =>
          data
            ? {
                ...data,
                pages: data.pages.map((page) => ({
                  ...page,
                  items: page.items.map((item) => ({
                    ...item,
                    isRead: true,
                    readAt: item.readAt ?? new Date().toISOString(),
                  })),
                })),
              }
            : data
      );
      queryClient.setQueryData([QUERY_KEYS.NOTIFICATION_UNREAD_COUNT], 0);
    },
  });
}

export function useNotificationSse() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const source = new EventSource(
      `${env.VITE_API_BASE_URL}/api/notifications/stream`,
      { withCredentials: true }
    );

    source.addEventListener("notification", (event) => {
      const notification = JSON.parse(
        (event as MessageEvent<string>).data
      ) as AppNotification;

      prependNotificationToCache(queryClient, notification);
      queryClient.setQueryData<number>(
        [QUERY_KEYS.NOTIFICATION_UNREAD_COUNT],
        (count) => (count ?? 0) + 1
      );
      toast(notification.title, {
        description: notification.description,
      });
    });

    source.onerror = () => {
      window.setTimeout(() => {
        void queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.NOTIFICATIONS],
        });
        void queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.NOTIFICATION_UNREAD_COUNT],
        });
      }, 3_000);
    };

    return () => source.close();
  }, [queryClient]);
}

export function useNotificationFocusRefresh() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleFocus = () => {
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.NOTIFICATIONS],
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.NOTIFICATION_UNREAD_COUNT],
      });
    };

    window.addEventListener("focus", handleFocus);

    return () => window.removeEventListener("focus", handleFocus);
  }, [queryClient]);
}

export function prependNotificationToCache(
  queryClient: ReturnType<typeof useQueryClient>,
  notification: AppNotification
) {
  queryClient.setQueriesData<InfiniteData<ListNotificationsResponse>>(
    { queryKey: [QUERY_KEYS.NOTIFICATIONS] },
    (data) => {
      if (!data) return data;

      const exists = data.pages.some((page) =>
        page.items.some((item) => item.id === notification.id)
      );

      if (exists) return data;

      const [firstPage, ...restPages] = data.pages;

      return {
        ...data,
        pages: [
          {
            ...(firstPage ?? { items: [], nextCursor: null }),
            items: [notification, ...(firstPage?.items ?? [])],
          },
          ...restPages,
        ],
      };
    }
  );
}

function updateNotificationInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  notification: AppNotification
) {
  queryClient.setQueriesData<InfiniteData<ListNotificationsResponse>>(
    { queryKey: [QUERY_KEYS.NOTIFICATIONS] },
    (data) =>
      data
        ? {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              items: page.items.map((item) =>
                item.id === notification.id ? notification : item
              ),
            })),
          }
        : data
  );
}
