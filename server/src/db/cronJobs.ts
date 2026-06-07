import { logger } from "../utils/logger";

/**
 * Register repeatable (cron) jobs here.
 *
 * Each entry is an async function that adds a repeatable job to a BullMQ queue,
 * e.g.:
 *
 *   async function initCleanupCronJob() {
 *     await cleanupQueue.add(
 *       "cleanup",
 *       {},
 *       { repeat: { pattern: "0 0 * * *" }, jobId: "cleanup" },
 *     );
 *   }
 *
 * Then add `initCleanupCronJob` to `cronJobsList` below.
 */
const cronJobsList: Array<() => Promise<void>> = [];

export async function initCronJobs() {
  for (const initJob of cronJobsList) {
    await initJob();
  }
  logger.info(`Initialized ${cronJobsList.length} cron job(s)`);
}
