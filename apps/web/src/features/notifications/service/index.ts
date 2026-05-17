import { apiFetch } from "@/shared/lib";
import type {
  AppNotification,
  ListNotificationsResponse,
  UnreadNotificationCountResponse,
} from "../notifications.types";

export const notificationsService = {
  listNotifications(input: { limit: number; cursor?: string | null }) {
    return apiFetch<ListNotificationsResponse>({
      method: "GET",
      url: "/notifications",
      params: {
        limit: input.limit,
        ...(input.cursor ? { cursor: input.cursor } : {}),
      },
    });
  },

  getUnreadCount() {
    return apiFetch<UnreadNotificationCountResponse>({
      method: "GET",
      url: "/notifications/unread-count",
    });
  },

  markNotificationRead(id: number) {
    return apiFetch<AppNotification>({
      method: "PATCH",
      url: `/notifications/${id}/read`,
    });
  },

  markAllNotificationsRead() {
    return apiFetch<{ success: boolean }>({
      method: "PATCH",
      url: "/notifications/read-all",
    });
  },
};
