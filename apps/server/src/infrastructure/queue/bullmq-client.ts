import IORedis from "ioredis";

import { bullMqConfig } from "@/config";
import { loggerServer } from "@/shared/utils";

const bullMqConnection = new IORedis(
  bullMqConfig.redisUrl,
  bullMqConfig.connection
);

bullMqConnection.on("connect", () => {
  loggerServer.info("BullMQ Redis connected");
});

bullMqConnection.on("error", (error) => {
  loggerServer.error("BullMQ Redis error:", error);
});

export { bullMqConnection };
