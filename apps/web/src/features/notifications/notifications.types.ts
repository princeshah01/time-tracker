export type AppNotification = {
  id: number;
  userId: string;
  type: string;
  title: string;
  description: string;
  href: string | null;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListNotificationsResponse = {
  items: AppNotification[];
  nextCursor: string | null;
};

export type UnreadNotificationCountResponse = {
  count: number;
};
