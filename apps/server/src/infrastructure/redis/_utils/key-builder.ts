const REDIS_KEY_SEPARATOR = ":";

export function buildRedisKey(...parts: Array<string | number | undefined | null>) {
  return parts
    .filter((part) => part !== undefined && part !== null && part !== "")
    .join(REDIS_KEY_SEPARATOR);
}