import { redis } from "./redis-client";
import { buildRedisKey } from "./_utils";
import { env } from "@/config";

const BETTER_AUTH_PREFIX = env.BETTER_AUTH_REDIS_PREFIX;

const betterAuthRedisStorage = {
  get: async (key: string) => {
    const redisKey = buildRedisKey(BETTER_AUTH_PREFIX, key);
    return redis.get(redisKey);
  },

  set: async (key: string, value: string, ttl?: number) => {
    const redisKey = buildRedisKey(BETTER_AUTH_PREFIX, key);

    if (ttl) {
      await redis.set(redisKey, value, {
        EX: ttl,
      });
      return;
    }

    await redis.set(redisKey, value);
  },

  delete: async (key: string) => {
    const redisKey = buildRedisKey(BETTER_AUTH_PREFIX, key);
    await redis.del(redisKey);
  },
};

export { betterAuthRedisStorage };
