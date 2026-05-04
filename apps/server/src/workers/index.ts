import { createEmailWorker } from "./email.worker";
import { loggerWorker } from "@/shared/utils";

const workers = {
  emailWorker: createEmailWorker(),
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

process.on("SIGINT", async () => {
  loggerWorker.info("Closing workers...");
  await workers.emailWorker.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  loggerWorker.info("Closing workers...");
  await workers.emailWorker.close();
  process.exit(0);
});

loggerWorker.info("Queue workers started");
