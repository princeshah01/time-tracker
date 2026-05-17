import { type Job, Worker } from "bullmq";

import { env } from "@/config";
import {
  bullMqConnection,
  type NotificationJobData,
  type NotificationJobName,
  QUEUE_NAMES,
  scheduleNotificationJobs,
} from "@/infrastructure/queue";
import { notificationsService } from "@/modules/notifications/notifications.service";
import { loggerWorker } from "@/shared/utils";

type NotificationWorkerJob = Job<
  NotificationJobData,
  void,
  NotificationJobName
>;

async function processNotificationJob(job: NotificationWorkerJob) {
  switch (job.data.type) {
    case "daily-missing-log-reminder":
      await notificationsService.runDailyMissingLogReminder();
      return;
    case "timesheet-ending-reminder":
      await notificationsService.runTimesheetEndingReminder();
      return;
    default:
      loggerWorker.info("[notification]", JSON.stringify(job.data, null, 2));
  }
}

function createNotificationsWorker() {
  loggerWorker.info("Starting notifications worker...");
  return new Worker<NotificationJobData, void, NotificationJobName>(
    QUEUE_NAMES.NOTIFICATIONS,
    processNotificationJob,
    {
      connection: bullMqConnection,
      prefix: env.QUEUE_PREFIX,
    }
  );
}

export { createNotificationsWorker, scheduleNotificationJobs };
