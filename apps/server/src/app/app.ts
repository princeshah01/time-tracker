import { toNodeHandler } from "better-auth/node";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { appRouter } from "@/app/routes";
import { auth } from "@/auth";
import { corsOptions } from "@/config";
import { errorMiddleware, notFoundMiddleware } from "@/shared/middlewares";
import { sendSuccess } from "@/shared/utils/api-response";

const app = express();

app.use(cors(corsOptions));

// Health check endpoint
app.get("/health", (_req, res) => {
  sendSuccess({
    res,
    message: "Server is healthy",
  });
});

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());
app.use(cookieParser());

app.use("/api", appRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export { app };
