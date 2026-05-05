import { Queue } from "bullmq";

import { bullMqConfig, env } from "@/config";
import { bullMqConnection, QUEUE_NAMES } from "@/infrastructure/queue";

export type EmailJobName =
  | "send-auth-otp-email"
  | "send-password-reset-email"
  | "send-invite-email"
  | "send-timesheet-share-email"
  | "send-timesheet-reminder-email";

export type EmailJobData =
  | {
      type: "send-auth-otp-email";
      to: string;
      otp: string;
      purpose:
        | "sign-in"
        | "sign-up"
        | "email-verification"
        | "change-email"
        | "invite"
        | "two-factor";
    }
  | {
      type: "send-password-reset-email";
      to: string;
      url: string;
    }
  | {
      type: "send-invite-email";
      to: string;
      inviteUrl: string;
      invitedByName?: string;
    }
  | {
      type: "send-timesheet-share-email";
      to: string;
      timesheetName: string;
      sharedByName: string;
      shareUrl: string;
    }
  | {
      type: "send-timesheet-reminder-email";
      to: string;
      timesheetName: string;
      dueDate: string;
      pendingDays?: string[];
    };

export const emailQueue = new Queue<EmailJobData, void, EmailJobName>(
  QUEUE_NAMES.EMAIL,
  {
    connection: bullMqConnection,
    prefix: env.QUEUE_PREFIX,
    defaultJobOptions: bullMqConfig.defaultJobOptions,
  }
);
