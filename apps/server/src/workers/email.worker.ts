import { type Job, Worker } from "bullmq";

import { bullmqConnection } from "@/lib/queues/bullmq-connection";
import type { EmailJobData, EmailJobName } from "@/lib/queues/email";
import { EMAIL_QUEUE_PREFIX } from "@/lib/queues/email";
import { QUEUE_NAMES } from "@/lib/queues/queue-names";

type EmailWorkerJob = Job<EmailJobData, void, EmailJobName>;

async function processEmailJob(job: EmailWorkerJob) {
  switch (job.data.type) {
    case "send-auth-otp-email":
      console.log(
        `[auth-email] ${job.data.purpose} OTP for ${job.data.to}: ${job.data.otp}`
      );
      return;
    case "send-password-reset-email":
      console.log(
        `[auth-email] password reset OTP for ${job.data.to}: ${job.data.otp}`
      );
      return;
    case "send-invite-email":
      console.log(
        `[auth-email] invite for ${job.data.to}: ${job.data.inviteUrl}`
      );
      return;
    default:
      console.log("[email]", JSON.stringify(job.data, null, 2));
  }
}

export function createEmailWorker() {
  return new Worker<EmailJobData, void, EmailJobName>(
    QUEUE_NAMES.EMAIL,
    processEmailJob,
    {
      connection: bullmqConnection,
      prefix: EMAIL_QUEUE_PREFIX,
    }
  );
}
