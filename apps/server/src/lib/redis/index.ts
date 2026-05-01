import { createClient, type RedisClientType } from "redis";
import { env } from "@/env";

export const redis = createClient({
  url: env.REDIS_URL,
}) as RedisClientType;

redis.on("error", (error) => {
  console.error("Redis error:", error);
});

export async function connectRedis() {
  console.log("Connecting to Redis...");
  if (!redis.isOpen) {
    await redis.connect();
  }
  console.log("Connected to Redis");
}