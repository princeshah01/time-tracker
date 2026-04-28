import { createNextEnv } from "@workspace/env/next";
import { nonEmptyString, url } from "@workspace/env/schema";

export const env = createNextEnv({
  client: {
    NEXT_PUBLIC_APP_NAME: nonEmptyString,
    NEXT_PUBLIC_APP_URL: url,
  },
});
