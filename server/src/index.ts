import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { createServer } from "http";
import morgan from "morgan";
import { Server } from "socket.io";
import { initCronJobs } from "./db/cronJobs";
import { routes } from "./routes";
import { socketServer } from "./sockets";
import { auth } from "./utils/auth";
import { limiter } from "./utils/limiter";
import { logger } from "./utils/logger";
import { closeWorkers } from "./workers/closeWorkers";

const app = express();
const PORT = parseInt(process.env.PORT!);

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

socketServer(io);

app.use(cors());
app.use(morgan("combined"));

// Better Auth handler must be mounted BEFORE express.json().
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use(limiter);
app.use("/", routes);

httpServer.listen(PORT, async () => {
  logger.info(`Server listening on port ${PORT} in ${process.env.NODE_ENV}`);
  await initCronJobs();
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, closing workers...");
  await closeWorkers();
  process.exit(0);
});
