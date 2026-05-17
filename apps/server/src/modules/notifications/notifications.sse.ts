import type { Response } from "express";

type SseNotification = {
  id: number;
  userId: string;
  type: string;
  title: string;
  description: string;
  href: string | null;
  entityType: string | null;
  entityId: string | null;
  metadata: unknown;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

class NotificationSseManager {
  private readonly clients = new Map<string, Set<Response>>();

  addClient(userId: string, res: Response) {
    const clients = this.clients.get(userId) ?? new Set<Response>();
    clients.add(res);
    this.clients.set(userId, clients);
  }

  removeClient(userId: string, res: Response) {
    const clients = this.clients.get(userId);
    if (!clients) return;

    clients.delete(res);
    if (clients.size === 0) {
      this.clients.delete(userId);
    }
  }

  isUserConnected(userId: string) {
    return Boolean(this.clients.get(userId)?.size);
  }

  sendToUser(userId: string, notification: SseNotification) {
    const clients = this.clients.get(userId);
    if (!clients?.size) return false;

    const payload = JSON.stringify(notification);

    for (const res of clients) {
      res.write(`event: notification\n`);
      res.write(`data: ${payload}\n\n`);
    }

    return true;
  }
}

export const notificationSseManager = new NotificationSseManager();
