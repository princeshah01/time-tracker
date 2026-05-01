import IORedis from "ioredis";
import { env } from "@/env";

export const bullmqConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

bullmqConnection.on("connect", () => {
  console.log("BullMQ Redis connected");
});

bullmqConnection.on("error", (error) => {
  console.error("BullMQ Redis error:", error);
});