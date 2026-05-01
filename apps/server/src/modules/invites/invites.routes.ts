import { Router } from "express";

import { asyncHandler } from "@/shared/http/async-handler";
import { invitesController } from "./invites.controller";

export const invitesRouter = Router();

invitesRouter.post(
  "/",
  asyncHandler((req, res) => invitesController.create(req, res))
);

invitesRouter.get(
  "/:token",
  asyncHandler((req, res) => invitesController.get(req, res))
);

invitesRouter.post(
  "/:token/accept",
  asyncHandler((req, res) => invitesController.accept(req, res))
);
