import { createNextEnv, nonEmptyString, url } from "@workspace/env";

export const env = createNextEnv({
  client: {
    NEXT_PUBLIC_APP_NAME: nonEmptyString,
    NEXT_PUBLIC_APP_URL: url,
  },
});
