import { type EmailJobData, emailQueue } from "./email.queue";

export async function addEmailJob(data: EmailJobData) {
  return emailQueue.add(data.type, data);
}

export async function addAuthOtpEmailJob(input: {
  to: string;
  otp: string;
  purpose:
    | "sign-in"
    | "sign-up"
    | "email-verification"
    | "change-email"
    | "two-factor";
}) {
  return emailQueue.add("send-auth-otp-email", {
    type: "send-auth-otp-email",
    to: input.to,
    otp: input.otp,
    purpose: input.purpose,
  });
}

export async function addPasswordResetOtpEmailJob(input: {
  to: string;
  otp: string;
}) {
  return emailQueue.add("send-password-reset-email", {
    type: "send-password-reset-email",
    to: input.to,
    otp: input.otp,
  });
}

export async function addInviteEmailJob(input: {
  to: string;
  inviteUrl: string;
  invitedByName?: string;
}) {
  return emailQueue.add("send-invite-email", {
    type: "send-invite-email",
    to: input.to,
    inviteUrl: input.inviteUrl,
    invitedByName: input.invitedByName,
  });
}

export async function addTimesheetShareEmailJob(input: {
  to: string;
  timesheetName: string;
  sharedByName: string;
  shareUrl: string;
}) {
  return emailQueue.add("send-timesheet-share-email", {
    type: "send-timesheet-share-email",
    to: input.to,
    timesheetName: input.timesheetName,
    sharedByName: input.sharedByName,
    shareUrl: input.shareUrl,
  });
}

export async function addTimesheetReminderEmailJob(input: {
  to: string;
  timesheetName: string;
  dueDate: string;
  pendingDays?: string[];
}) {
  return emailQueue.add("send-timesheet-reminder-email", {
    type: "send-timesheet-reminder-email",
    to: input.to,
    timesheetName: input.timesheetName,
    dueDate: input.dueDate,
    pendingDays: input.pendingDays,
  });
}
