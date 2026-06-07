import { Job, Worker } from "bullmq";
import { redisConnection } from "../queues";
import { NotificationJobData } from "../queues/notificationsQueue";
import { logger } from "../utils/logger";
import { sendPushNotifications } from "../utils/pushNotifications";

/**
 * Example worker: processes jobs from the `notifications` queue by sending an
 * Expo push notification. Use this as a template for your own workers.
 */
async function processNotificationJob(job: Job<NotificationJobData>) {
  const { userIds, title, body, data } = job.data;
  await sendPushNotifications({ userIds, title, body, data });
}

export const notificationsWorker = new Worker<NotificationJobData>(
  "notifications",
  processNotificationJob,
  {
    connection: redisConnection,
    concurrency: 10,
  },
);

notificationsWorker.on("completed", (job) => {
  logger.info(`Notification job ${job.id} completed`);
});

notificationsWorker.on("failed", (job, err) => {
  logger.error(`Notification job ${job?.id} failed`, { error: err });
});
