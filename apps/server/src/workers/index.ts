import { createEmailWorker } from "./email.worker";
import {
  createNotificationsWorker,
  scheduleNotificationJobs,
} from "./notifications.worker";
import { loggerWorker } from "@/shared/utils";

const workers = {
  emailWorker: createEmailWorker(),
  notificationsWorker: createNotificationsWorker(),
};

workers.emailWorker.on("ready", () => {
  loggerWorker.info("Email worker ready");
});

workers.emailWorker.on("completed", (job) => {
  loggerWorker.info(`Email job completed: ${job.id}`);
});

workers.emailWorker.on("failed", (job, error) => {
  loggerWorker.error(`Email job failed: ${job?.id}`, error);
});

workers.emailWorker.on("error", (error) => {
  loggerWorker.error("Email worker error", error);
});

workers.notificationsWorker.on("ready", () => {
  loggerWorker.info("Notifications worker ready");
});

workers.notificationsWorker.on("completed", (job) => {
  loggerWorker.info(`Notification job completed: ${job.id}`);
});

workers.notificationsWorker.on("failed", (job, error) => {
  loggerWorker.error(`Notification job failed: ${job?.id}`, error);
});

workers.notificationsWorker.on("error", (error) => {
  loggerWorker.error("Notifications worker error", error);
});

void scheduleNotificationJobs().catch((error) => {
  loggerWorker.error("Failed to schedule notification jobs", error);
});

process.on("SIGINT", async () => {
  loggerWorker.info("Closing workers...");
  await workers.emailWorker.close();
  await workers.notificationsWorker.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  loggerWorker.info("Closing workers...");
  await workers.emailWorker.close();
  await workers.notificationsWorker.close();
  process.exit(0);
});

loggerWorker.info("Queue workers started");
