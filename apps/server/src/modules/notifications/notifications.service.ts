import { AppError } from "@/shared/utils";
import { NotificationsRepository } from "./notifications.repository";
import { notificationSseManager } from "./notifications.sse";
import {
  type CreateNotificationInput,
  type NotificationCursor,
  notificationTypes,
} from "./notifications.types";
import type { ListNotificationsInput } from "./notifications.validation";

const COMPLETE_DAY_MINUTES = 480;
const KOLKATA_TIME_ZONE = "Asia/Kolkata";

type NotificationRecord = NonNullable<
  Awaited<ReturnType<NotificationsRepository["createNotification"]>>
>;

export class NotificationsService {
  constructor(
    private readonly notificationsRepository = new NotificationsRepository()
  ) {}

  async createNotification(input: CreateNotificationInput) {
    const notification =
      await this.notificationsRepository.createNotification(input);

    if (!notification) {
      throw new AppError({
        message: "Failed to create notification",
        code: "INTERNAL_SERVER_ERROR",
        isOperational: false,
      });
    }

    await this.deliverNotification(notification);

    return notification;
  }

  async createNotificationOnce(
    input: CreateNotificationInput,
    dedupeKey: string
  ) {
    const dedupe = await this.notificationsRepository.createDedupeRecord(
      input.userId,
      dedupeKey
    );

    if (!dedupe) return null;

    return this.createNotification(input);
  }

  async listNotifications(userId: string, input: ListNotificationsInput) {
    const rows = await this.notificationsRepository.listNotifications({
      userId,
      limit: input.limit,
      cursor: input.cursor as NotificationCursor | undefined,
    });
    const hasNextPage = rows.length > input.limit;
    const items = hasNextPage ? rows.slice(0, input.limit) : rows;
    const lastItem = items.at(-1);

    return {
      items,
      nextCursor: hasNextPage && lastItem ? this.encodeCursor(lastItem) : null,
    };
  }

  getUnreadCount(userId: string) {
    return this.notificationsRepository.getUnreadCount(userId);
  }

  async markRead(userId: string, notificationId: number) {
    const notification = await this.notificationsRepository.markRead(
      userId,
      notificationId
    );

    if (!notification) {
      throw new AppError({
        message: "Notification not found",
        code: "NOT_FOUND",
      });
    }

    return notification;
  }

  async markAllRead(userId: string) {
    await this.notificationsRepository.markAllRead(userId);

    return { success: true };
  }

  async runDailyMissingLogReminder(referenceDate = new Date()) {
    const dateKey = toKolkataDateKey(referenceDate);
    const date = dateFromDateKey(dateKey);

    if (isWeeklyOff(date)) return;

    const timesheets =
      await this.notificationsRepository.listActiveTimesheetsForDate(date);

    for (const timesheet of timesheets) {
      const users = await this.notificationsRepository.listTimesheetUsers(
        timesheet.id
      );

      for (const assignedUser of users) {
        if (
          await this.notificationsRepository.hasTimesheetLeave({
            timesheetId: timesheet.id,
            userId: assignedUser.userId,
            date,
          })
        ) {
          continue;
        }

        const minutes =
          await this.notificationsRepository.getTimesheetEntryMinutes({
            timesheetId: timesheet.id,
            userId: assignedUser.userId,
            date,
          });

        if (minutes === 0) {
          await this.createNotificationOnce(
            {
              userId: assignedUser.userId,
              type: notificationTypes.missingDailyLog,
              title: "Daily timesheet missing",
              description: `No time has been logged for ${timesheet.timesheetName} today.`,
              href: `/timesheet/${timesheet.id}/sheets`,
              entityType: "timesheet",
              entityId: String(timesheet.id),
              metadata: { date: dateKey, timesheetId: timesheet.id },
            },
            `missing-log:${timesheet.id}:${assignedUser.userId}:${dateKey}`
          );
        } else if (minutes < COMPLETE_DAY_MINUTES) {
          await this.createNotificationOnce(
            {
              userId: assignedUser.userId,
              type: notificationTypes.incompleteDailyLog,
              title: "Daily timesheet incomplete",
              description: `${formatMinutes(minutes)} logged for ${timesheet.timesheetName}; expected 8h.`,
              href: `/timesheet/${timesheet.id}/sheets`,
              entityType: "timesheet",
              entityId: String(timesheet.id),
              metadata: { date: dateKey, timesheetId: timesheet.id, minutes },
            },
            `incomplete-log:${timesheet.id}:${assignedUser.userId}:${dateKey}`
          );
        }
      }
    }
  }

  async runTimesheetEndingReminder(referenceDate = new Date()) {
    const todayKey = toKolkataDateKey(referenceDate);
    const today = dateFromDateKey(todayKey);
    const start = addDays(today, -3);
    const end = addDays(today, 1);
    const timesheets =
      await this.notificationsRepository.listTimesheetsEndingBetween(
        start,
        end
      );

    for (const timesheet of timesheets) {
      const startReminder = addDays(timesheet.endDate, -1);
      const graceEnd = addDays(timesheet.endDate, 3);
      const normalizedEnd = dateFromDateKey(
        toKolkataDateKey(timesheet.endDate)
      );

      if (today < startReminder || today > graceEnd) continue;

      const users = await this.notificationsRepository.listTimesheetUsers(
        timesheet.id
      );

      for (const assignedUser of users) {
        const pending = await this.countPendingTimesheetDays({
          timesheetId: timesheet.id,
          userId: assignedUser.userId,
          startDate: timesheet.startDate,
          endDate: timesheet.endDate,
        });

        if (pending === 0) continue;

        const isGrace = today > normalizedEnd;

        await this.createNotificationOnce(
          {
            userId: assignedUser.userId,
            type: isGrace
              ? notificationTypes.timesheetGraceMissingLog
              : notificationTypes.timesheetEndingMissingLog,
            title: isGrace
              ? "Timesheet grace period reminder"
              : "Timesheet ending reminder",
            description: `${timesheet.timesheetName} has ${pending} missing or incomplete working ${pending === 1 ? "day" : "days"}.`,
            href: `/timesheet/${timesheet.id}/sheets`,
            entityType: "timesheet",
            entityId: String(timesheet.id),
            metadata: {
              date: todayKey,
              timesheetId: timesheet.id,
              pendingDays: pending,
            },
          },
          `timesheet-ending:${timesheet.id}:${assignedUser.userId}:${todayKey}`
        );
      }
    }
  }

  async notifyTimesheetAssigned(input: {
    timesheetId: number;
    timesheetName: string;
    userIds: string[];
  }) {
    await Promise.all(
      input.userIds.map((userId) =>
        this.createNotificationOnce(
          {
            userId,
            type: notificationTypes.timesheetAssigned,
            title: "Added to timesheet",
            description: `You were added to ${input.timesheetName}.`,
            href: `/timesheet/${input.timesheetId}/sheets`,
            entityType: "timesheet",
            entityId: String(input.timesheetId),
            metadata: { timesheetId: input.timesheetId },
          },
          `timesheet-assigned:${input.timesheetId}:${userId}`
        )
      )
    );
  }

  async notifyProjectAssigned(input: {
    projectId: number;
    projectName: string;
    userIds: string[];
  }) {
    await Promise.all(
      input.userIds.map((userId) =>
        this.createNotificationOnce(
          {
            userId,
            type: notificationTypes.projectAssigned,
            title: "Added to project",
            description: `You were added to ${input.projectName}.`,
            href: `/projects/${input.projectId}`,
            entityType: "project",
            entityId: String(input.projectId),
            metadata: { projectId: input.projectId },
          },
          `project-assigned:${input.projectId}:${userId}`
        )
      )
    );
  }

  private async deliverNotification(notification: NotificationRecord) {
    if (!notificationSseManager.isUserConnected(notification.userId)) return;

    notificationSseManager.sendToUser(notification.userId, notification);
    await this.notificationsRepository.createDelivery({
      notificationId: notification.id,
      userId: notification.userId,
      channel: "sse",
      status: "sent",
      sentAt: new Date(),
    });
  }

  private encodeCursor(notification: { createdAt: Date; id: number }) {
    return Buffer.from(
      JSON.stringify({
        createdAt: notification.createdAt.toISOString(),
        id: notification.id,
      })
    ).toString("base64url");
  }

  private async countPendingTimesheetDays(input: {
    timesheetId: number;
    userId: string;
    startDate: Date;
    endDate: Date;
  }) {
    const dates = buildDateRange(input.startDate, input.endDate);
    let pending = 0;

    for (const date of dates) {
      if (isWeeklyOff(date)) continue;

      if (
        await this.notificationsRepository.hasTimesheetLeave({
          timesheetId: input.timesheetId,
          userId: input.userId,
          date,
        })
      ) {
        continue;
      }

      const minutes =
        await this.notificationsRepository.getTimesheetEntryMinutes({
          timesheetId: input.timesheetId,
          userId: input.userId,
          date,
        });

      if (minutes < COMPLETE_DAY_MINUTES) pending += 1;
    }

    return pending;
  }
}

function toKolkataDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: KOLKATA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function dateFromDateKey(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function addDays(date: Date, days: number) {
  const normalized = dateFromDateKey(toKolkataDateKey(date));
  normalized.setUTCDate(normalized.getUTCDate() + days);

  return normalized;
}

function buildDateRange(startDate: Date, endDate: Date) {
  const dates: Date[] = [];
  const end = dateFromDateKey(toKolkataDateKey(endDate));
  let current = dateFromDateKey(toKolkataDateKey(startDate));

  while (current <= end) {
    dates.push(new Date(current));
    current = addDays(current, 1);
  }

  return dates;
}

function isWeeklyOff(date: Date) {
  const day = date.getUTCDay();

  return day === 0 || day === 6;
}

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours === 0) return `${remainder}m`;
  if (remainder === 0) return `${hours}h`;

  return `${hours}h ${remainder}m`;
}

export const notificationsService = new NotificationsService();
