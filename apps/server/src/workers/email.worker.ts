import { type Job, Worker } from "bullmq";

import { env } from "@/config";
import { QUEUE_NAMES,
  bullMqConnection,
type EmailJobData, type EmailJobName
 } from "@/infrastructure/queue";
import { loggerWorker } from "@/shared/utils";

type EmailWorkerJob = Job<EmailJobData, void, EmailJobName>;

async function processEmailJob(job: EmailWorkerJob) {
  switch (job.data.type) {
    case "send-auth-otp-email":
      loggerWorker.info(
        `OTP for ${job.data.to}: ${job.data.otp}`
      );
      return;
    case "send-password-reset-email":
      loggerWorker.info(
        `password reset OTP for ${job.data.to}: ${job.data.otp}`
      );
      return;
    case "send-invite-email":
      loggerWorker.info(
        `invite for ${job.data.to}: ${job.data.inviteUrl}`
      );
      return;
    default:
      loggerWorker.info("[email]", JSON.stringify(job.data, null, 2));
  }
}

function createEmailWorker() {
  loggerWorker.info("Starting email worker...");
  return new Worker<EmailJobData, void, EmailJobName>(
    QUEUE_NAMES.EMAIL,
    processEmailJob,
    {
      connection: bullMqConnection,
      prefix: env.QUEUE_PREFIX,
    }
  );
}

export { createEmailWorker };