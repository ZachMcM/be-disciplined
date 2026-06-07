import { notificationsWorker } from "./notificationsWorker";

const workersList = [notificationsWorker];

/** Gracefully close all BullMQ workers on shutdown. */
export async function closeWorkers() {
  for (const worker of workersList) {
    await worker.close();
  }
}
