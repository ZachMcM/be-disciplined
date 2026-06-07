import { createClient } from "redis";
import { logger } from "./logger";

export const redis = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PW,
  socket: {
    host: process.env.REDIS_HOST!,
    port: parseInt(process.env.REDIS_PORT!),
  },
});

redis.on("error", (err) => logger.error("Redis client error:", err));

redis.connect();
