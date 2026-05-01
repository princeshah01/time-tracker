import { redis } from "@/lib/redis";
import { buildRedisKey } from "@/lib/redis/_utils/key-builder";

const BETTER_AUTH_PREFIX = "better-auth";

const betterAuthSecondaryStorage = {
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

export { betterAuthSecondaryStorage };