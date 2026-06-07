import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redis } from "./redis";

const MAX_REQS_PER_WINDOW = 1000;

export const limiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.sendCommand(args),
  }),
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: MAX_REQS_PER_WINDOW,
  message: "Too many requests from this IP, please try again later",
  skip: () => {
    // Skip rate limiting if Redis is not ready (don't take the app down with it).
    return !redis.isReady;
  },
});
