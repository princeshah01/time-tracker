import { Queue } from "bullmq";

import { bullmqConnection } from "../bullmq-connection";
import { QUEUE_NAMES } from "../queue-names";
import { EMAIL_QUEUE_PREFIX } from "./email.constants";

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
        | "two-factor";
    }
  | {
      type: "send-password-reset-email";
      to: string;
      otp: string;
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
    connection: bullmqConnection,
    prefix: EMAIL_QUEUE_PREFIX,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 3000,
      },
      removeOnComplete: {
        age: 60 * 60 * 24,
        count: 1000,
      },
      removeOnFail: {
        age: 60 * 60 * 24 * 7,
      },
    },
  }
);
