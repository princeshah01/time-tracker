import { Router } from "express";

import { requireAuth, validate } from "@/shared/middlewares";
import { notificationsController } from "./notifications.controllers";
import {
  listNotificationsSchema,
  notificationIdParamSchema,
} from "./notifications.validation";

const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get(
  "/",
  validate(listNotificationsSchema),
  notificationsController.list
);

notificationsRouter.get("/unread-count", notificationsController.unreadCount);

notificationsRouter.get("/stream", notificationsController.stream);

notificationsRouter.patch("/read-all", notificationsController.markAllRead);

notificationsRouter.patch(
  "/:id/read",
  validate(notificationIdParamSchema),
  notificationsController.markRead
);

export { notificationsRouter };
