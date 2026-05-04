import { createClient, type RedisClientType } from "redis";
import { redisConfig } from "@/config";
import { loggerServer } from "@/shared/utils";

const redis = createClient(redisConfig) as RedisClientType;

redis.on("error", (error) => {
  loggerServer.error("Redis error:", error);
});

async function connectRedis() {
  loggerServer.info("Connecting to Redis...");
  if (!redis.isOpen) {
    await redis.connect();
  }
  loggerServer.info("Connected to Redis");
}

async function disconnectRedis() {
  if (redis.isOpen) {
    await redis.quit();
  }
  loggerServer.info("Disconnected from Redis");
}

export { redis, connectRedis, disconnectRedis };
