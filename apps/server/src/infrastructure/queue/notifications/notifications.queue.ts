import { Queue } from "bullmq";

import { bullMqConfig, env } from "@/config";
import { bullMqConnection, QUEUE_NAMES } from "@/infrastructure/queue";

export type NotificationJobName =
  | "daily-missing-log-reminder"
  | "timesheet-ending-reminder";

export type NotificationJobData =
  | {
      type: "daily-missing-log-reminder";
    }
  | {
      type: "timesheet-ending-reminder";
    };

export const notificationsQueue = new Queue<
  NotificationJobData,
  void,
  NotificationJobName
>(QUEUE_NAMES.NOTIFICATIONS, {
  connection: bullMqConnection,
  prefix: env.QUEUE_PREFIX,
  defaultJobOptions: bullMqConfig.defaultJobOptions,
});
