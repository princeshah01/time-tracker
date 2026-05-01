import { type Job, Worker } from "bullmq";
import { sendEmail } from "@/lib/email/send-email";
import { bullmqConnection } from "@/lib/queues/bullmq-connection";
import { QUEUE_NAMES } from "@/lib/queues/queue-names";
import type { EmailJobData, EmailJobName } from "@/lib/queues/email";
import { EMAIL_QUEUE_PREFIX } from "@/lib/queues/email";

type EmailWorkerJob = Job<EmailJobData, void, EmailJobName>;

function buildEmailPayload(data: EmailJobData) {
  return {
    to: data.to,
    subject: data.type,
    body: JSON.stringify(data, null, 2),
  };
}

async function processEmailJob(job: EmailWorkerJob) {
  const email = buildEmailPayload(job.data);

  await sendEmail(email.to, email.subject, email.body);
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
