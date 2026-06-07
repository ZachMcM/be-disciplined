import { Queue } from "bullmq";
import { redisConnection } from ".";

/**
 * Example queue: enqueue a push notification to be sent to one or more users.
 * Replace/extend the job data shape to fit your app.
 */
export type NotificationJobData = {
  userIds: string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

export const notificationsQueue = new Queue<NotificationJobData>(
  "notifications",
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: 100,
      removeOnFail: 1000,
    },
  },
);
