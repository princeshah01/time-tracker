import type { CorsOptions } from "cors";

import { env } from "@/config";

const allowedOrigins = [
  env.CLIENT_URL,
].filter(Boolean);

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },

  credentials: true,
};

export { corsOptions };