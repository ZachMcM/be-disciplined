import { io } from "..";
import { logger } from "./logger";

/**
 * Broadcast a TanStack Query invalidation to every connected client. The client's
 * `InvalidationProvider` receives `data-invalidated` and refetches the key.
 */
export function invalidateQueries(...keys: (string | number)[][]) {
  for (const key of keys) {
    logger.debug(`Invalidating queryKey ${JSON.stringify(key)}`);
    io.of("/invalidation").emit("data-invalidated", key);
  }
}

/** Invalidate query keys for a single user. */
export function invalidateQueriesForUser(
  userId: string,
  ...keys: (string | number)[][]
) {
  for (const key of keys) {
    logger.debug(
      `Invalidating queryKey ${JSON.stringify(key)} for user ${userId}`,
    );
    io.of("/invalidation").to(`user:${userId}`).emit("data-invalidated", key);
  }
}

/** Invalidate query keys for a set of users. */
export function invalidateQueriesForUsers(
  userIds: string[],
  ...keys: (string | number)[][]
) {
  for (const key of keys) {
    for (const userId of userIds) {
      io.of("/invalidation").to(`user:${userId}`).emit("data-invalidated", key);
    }
  }
}
