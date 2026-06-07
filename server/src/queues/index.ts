import IORedis from "ioredis";

/**
 * Shared Redis connection for BullMQ. `maxRetriesPerRequest: null` is required by
 * BullMQ. Reuse this connection across all queues and workers.
 */
export const redisConnection = new IORedis({
  host: process.env.REDIS_HOST!,
  port: parseInt(process.env.REDIS_PORT!),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PW,
  maxRetriesPerRequest: null,
});
