import "dotenv/config";

import {
  createNodeEnv,
  nodeEnv,
  nonEmptyString,
  positiveInt,
  url,
} from "@workspace/env";

export const env = createNodeEnv({
  NODE_ENV: nodeEnv,
  PORT: positiveInt,
  DATABASE_URL: url,
  MICROSOFT_CLIENT_ID: nonEmptyString,
  MICROSOFT_CLIENT_SECRET: nonEmptyString,
  MICROSOFT_TENANT_ID: nonEmptyString,
  MICROSOFT_ALLOWED_DOMAIN: nonEmptyString,
  BETTER_AUTH_SECRET: nonEmptyString,
  BETTER_AUTH_URL: url,
  CLIENT_URL: url,
  REDIS_URL: url,
  QUEUE_PREFIX: nonEmptyString,
  BETTER_AUTH_REDIS_PREFIX: nonEmptyString,
  OLD_DB_CONNECTION_STRING: url,
  NEW_DB_CONNECTION_STRING: url,
});
