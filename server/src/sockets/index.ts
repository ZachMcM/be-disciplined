import { Server } from "socket.io";
import { invalidationHandler } from "./invalidation";

export function socketServer(io: Server) {
  io.of("/invalidation").on("connection", invalidationHandler);
}
