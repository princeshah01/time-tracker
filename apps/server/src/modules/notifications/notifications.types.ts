export const notificationTypes = {
  missingDailyLog: "MISSING_DAILY_LOG",
  incompleteDailyLog: "INCOMPLETE_DAILY_LOG",
  timesheetAssigned: "TIMESHEET_ASSIGNED",
  projectAssigned: "PROJECT_ASSIGNED",
  timesheetEndingMissingLog: "TIMESHEET_ENDING_MISSING_LOG",
  timesheetGraceMissingLog: "TIMESHEET_GRACE_MISSING_LOG",
} as const;

export type NotificationType =
  (typeof notificationTypes)[keyof typeof notificationTypes];

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  description: string;
  href?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type NotificationCursor = {
  createdAt: string;
  id: number;
};
