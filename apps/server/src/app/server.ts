import { sql } from "drizzle-orm";

import { app } from "@/app/app";
import { env } from "@/config";
import { db } from "@/db";
import { connectRedis, disconnectRedis } from "@/infrastructure/redis";
import { loggerServer } from "@/shared/utils";

async function assertDatabaseConnection() {
  loggerServer.info("Checking database connection...");

  try {
    await db.execute(sql`select 1`);
    loggerServer.info("Database connected");
  } catch (error) {
    loggerServer.error("Database connection failed", error);
    process.exit(1);
  }
}

async function startServer() {
  try {
    await assertDatabaseConnection();
    await connectRedis();

    const server = app.listen(env.PORT, () => {
      loggerServer.info(`Server running on http://localhost:${env.PORT}`);
    });

    server.on("error", (error) => {
      loggerServer.error("Server failed to start", error);
      process.exit(1);
    });

    const shutdown = async (signal: string) => {
      loggerServer.info(`Received ${signal}, shutting down...`);

      server.close(async () => {
        try {
          await disconnectRedis();
          loggerServer.info("Server closed gracefully");
          process.exit(0);
        } catch (error) {
          loggerServer.error("Error during shutdown", error);
          process.exit(1);
        }
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    loggerServer.error("Startup error", error);
    process.exit(1);
  }
}

export { startServer };
