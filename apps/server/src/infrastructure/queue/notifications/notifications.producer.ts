import { notificationsQueue } from "./notifications.queue";

export async function scheduleNotificationJobs() {
  await notificationsQueue.add(
    "daily-missing-log-reminder",
    { type: "daily-missing-log-reminder" },
    {
      jobId: "daily-missing-log-reminder",
      repeat: {
        every: 30 * 1000, // 30 sec
        // TODO: Change the pattern to 30 17 * * * for production
        // pattern: "30 17 * * *",
        // tz: "Asia/Kolkata",
      },
    }
  );

  await notificationsQueue.add(
    "timesheet-ending-reminder",
    { type: "timesheet-ending-reminder" },
    {
      jobId: "timesheet-ending-reminder",
      repeat: {
        every: 30 * 1000, // 30 sec
        // TODO: Change the pattern to 0 9 * * * for production
        // pattern: "0 9 * * *",
        // tz: "Asia/Kolkata",
      },
    }
  );
}
