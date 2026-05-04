import type { RedisOptions } from "ioredis";
import { env } from "@/config";

const bullMqConfig = {
  redisUrl: env.REDIS_URL,

  connection: {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  } satisfies RedisOptions,

  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential" as const,
      delay: 3000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
};

export { bullMqConfig };
