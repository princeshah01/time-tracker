import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lte,
  lt,
  or,
  sql,
  sum,
} from "drizzle-orm";

import { db } from "@/db";
import {
  notificationDeduplication,
  notificationDeliveries,
  notifications,
  projects,
  projectTeamMembers,
  timesheetDayLeaves,
  timesheetEntries,
  timesheets,
  timesheetUsers,
} from "@/db/schema";
import type {
  CreateNotificationInput,
  NotificationCursor,
} from "./notifications.types";

export class NotificationsRepository {
  async createNotification(input: CreateNotificationInput) {
    const [notification] = await db
      .insert(notifications)
      .values({
        userId: input.userId,
        type: input.type,
        title: input.title,
        description: input.description,
        href: input.href ?? null,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        metadata: input.metadata ?? null,
      })
      .returning();

    return notification ?? null;
  }

  async createDedupeRecord(userId: string, dedupeKey: string) {
    const [record] = await db
      .insert(notificationDeduplication)
      .values({ userId, dedupeKey })
      .onConflictDoNothing()
      .returning({ id: notificationDeduplication.id });

    return record ?? null;
  }

  async listNotifications(input: {
    userId: string;
    limit: number;
    cursor?: NotificationCursor;
  }) {
    const cursorDate = input.cursor ? new Date(input.cursor.createdAt) : null;
    const cursorWhere =
      input.cursor && cursorDate
        ? or(
            lt(notifications.createdAt, cursorDate),
            and(
              eq(notifications.createdAt, cursorDate),
              lt(notifications.id, input.cursor.id)
            )
          )
        : undefined;

    return db
      .select()
      .from(notifications)
      .where(
        cursorWhere
          ? and(eq(notifications.userId, input.userId), cursorWhere)
          : eq(notifications.userId, input.userId)
      )
      .orderBy(desc(notifications.createdAt), desc(notifications.id))
      .limit(input.limit + 1);
  }

  async getUnreadCount(userId: string) {
    const [result] = await db
      .select({ value: count() })
      .from(notifications)
      .where(
        and(eq(notifications.userId, userId), eq(notifications.isRead, false))
      );

    return Number(result?.value ?? 0);
  }

  async markRead(userId: string, notificationId: number) {
    const [notification] = await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.id, notificationId)
        )
      )
      .returning();

    return notification ?? null;
  }

  async markAllRead(userId: string) {
    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(eq(notifications.userId, userId), eq(notifications.isRead, false))
      );
  }

  async createDelivery(input: {
    notificationId: number;
    userId: string;
    channel: "sse";
    status: "sent";
    error?: string | null;
    sentAt?: Date | null;
  }) {
    const [delivery] = await db
      .insert(notificationDeliveries)
      .values(input)
      .returning();

    return delivery ?? null;
  }

  async listActiveTimesheetsForDate(date: Date) {
    return db
      .select({
        id: timesheets.id,
        timesheetName: timesheets.timesheetName,
        startDate: timesheets.startDate,
        endDate: timesheets.endDate,
        project: {
          id: projects.id,
          name: projects.name,
        },
      })
      .from(timesheets)
      .innerJoin(projects, eq(timesheets.projectId, projects.id))
      .where(
        and(lte(timesheets.startDate, date), gte(timesheets.endDate, date))
      );
  }

  async listTimesheetsEndingBetween(start: Date, end: Date) {
    return db
      .select({
        id: timesheets.id,
        timesheetName: timesheets.timesheetName,
        startDate: timesheets.startDate,
        endDate: timesheets.endDate,
        project: {
          id: projects.id,
          name: projects.name,
        },
      })
      .from(timesheets)
      .innerJoin(projects, eq(timesheets.projectId, projects.id))
      .where(and(gte(timesheets.endDate, start), lte(timesheets.endDate, end)));
  }

  async listTimesheetUsers(timesheetId: number) {
    return db
      .select({
        userId: timesheetUsers.userId,
      })
      .from(timesheetUsers)
      .where(eq(timesheetUsers.timesheetId, timesheetId));
  }

  async hasTimesheetLeave(input: {
    timesheetId: number;
    userId: string;
    date: Date;
  }) {
    const [record] = await db
      .select({ id: timesheetDayLeaves.id })
      .from(timesheetDayLeaves)
      .where(
        and(
          eq(timesheetDayLeaves.timesheetId, input.timesheetId),
          eq(timesheetDayLeaves.userId, input.userId),
          eq(timesheetDayLeaves.leaveDate, input.date)
        )
      )
      .limit(1);

    return Boolean(record);
  }

  async getTimesheetEntryMinutes(input: {
    timesheetId: number;
    userId: string;
    date: Date;
  }) {
    const [result] = await db
      .select({
        value: sum(timesheetEntries.minutesSpent),
      })
      .from(timesheetEntries)
      .where(
        and(
          eq(timesheetEntries.timesheetId, input.timesheetId),
          eq(timesheetEntries.userId, input.userId),
          eq(timesheetEntries.entryDate, input.date)
        )
      );

    return Number(result?.value ?? 0);
  }

  async listProjectMembers(projectId: number) {
    return db
      .select({ userId: projectTeamMembers.userId })
      .from(projectTeamMembers)
      .where(eq(projectTeamMembers.projectId, projectId));
  }
}
