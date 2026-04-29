import { createNodeEnv, url } from "@workspace/env";

export const env = createNodeEnv({
  DATABASE_URL: url,
});
