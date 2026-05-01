import { createEmailWorker } from "./email.worker";

export function startQueueWorkers() {
  return {
    emailWorker: createEmailWorker(),
  };
}
