import { createReactEnv, nonEmptyString, url } from "@workspace/env";

export const env = createReactEnv({
  client: {
    VITE_API_BASE_URL: url,
    VITE_APP_NAME: nonEmptyString,
  },
});
