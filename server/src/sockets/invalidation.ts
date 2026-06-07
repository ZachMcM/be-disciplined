import { Socket } from "socket.io";
import { logger } from "../utils/logger";

/**
 * Each client joins a room keyed by its user id so the server can target query
 * invalidations per-user (see `utils/invalidateQueries.ts`).
 */
export function invalidationHandler(socket: Socket) {
  const userId = socket.handshake.auth.userId;
  socket.join(`user:${userId}`);

  logger.info(`User ${userId} connected to invalidation socket`);

  socket.on("disconnect", () => {
    logger.info(`User ${userId} disconnected from invalidation socket`);
  });
}
