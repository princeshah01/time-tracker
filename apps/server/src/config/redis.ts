import { env } from "@/config";

const redisConfig = {
  url: env.REDIS_URL,
} as const;

export  { redisConfig };