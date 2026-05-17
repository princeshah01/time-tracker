import type { Request, Response } from "express";

import type { ValidatedRequest } from "@/shared/middlewares";
import { requireRouteUser } from "@/shared/session";
import { sendSuccess } from "@/shared/utils";
import { notificationsService } from "./notifications.service";
import { notificationSseManager } from "./notifications.sse";
import type {
  listNotificationsSchema,
  notificationIdParamSchema,
} from "./notifications.validation";

export class NotificationsController {
  async list(req: Request, res: Response) {
    const { query } = (req as ValidatedRequest<typeof listNotificationsSchema>)
      .validated;
    const user = requireRouteUser(req);
    const notifications = await notificationsService.listNotifications(
      user.id,
      query
    );

    return sendSuccess({
      res,
      data: notifications,
      message: "Notifications fetched successfully",
    });
  }

  async unreadCount(req: Request, res: Response) {
    const user = requireRouteUser(req);
    const count = await notificationsService.getUnreadCount(user.id);

    return sendSuccess({
      res,
      data: { count },
      message: "Unread notification count fetched successfully",
    });
  }

  async markRead(req: Request, res: Response) {
    const { params } = (
      req as ValidatedRequest<typeof notificationIdParamSchema>
    ).validated;
    const user = requireRouteUser(req);
    const notification = await notificationsService.markRead(
      user.id,
      params.id
    );

    return sendSuccess({
      res,
      data: notification,
      message: "Notification marked as read",
    });
  }

  async markAllRead(req: Request, res: Response) {
    const user = requireRouteUser(req);
    const result = await notificationsService.markAllRead(user.id);

    return sendSuccess({
      res,
      data: result,
      message: "Notifications marked as read",
    });
  }

  async stream(req: Request, res: Response) {
    const user = requireRouteUser(req);

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.write(`event: connected\n`);
    res.write(`data: ${JSON.stringify({ connected: true })}\n\n`);

    notificationSseManager.addClient(user.id, res);

    const heartbeat = setInterval(() => {
      res.write(`event: heartbeat\n`);
      res.write(
        `data: ${JSON.stringify({ at: new Date().toISOString() })}\n\n`
      );
    }, 25_000);

    req.on("close", () => {
      clearInterval(heartbeat);
      notificationSseManager.removeClient(user.id, res);
      res.end();
    });
  }
}

export const notificationsController = new NotificationsController();
