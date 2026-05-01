import { Router } from "express";

import { asyncHandler } from "@/shared/http/async-handler";
import { securityController } from "./security.controller";

export const securityRouter = Router();

securityRouter.post(
  "/change-password",
  asyncHandler((req, res) => securityController.changePassword(req, res))
);

securityRouter.post(
  "/set-password",
  asyncHandler((req, res) => securityController.setPassword(req, res))
);

securityRouter.post(
  "/two-factor/setup",
  asyncHandler((req, res) => securityController.enableTwoFactor(req, res))
);

securityRouter.post(
  "/two-factor/verify",
  asyncHandler((req, res) => securityController.verifyTwoFactor(req, res))
);

securityRouter.post(
  "/two-factor/disable",
  asyncHandler((req, res) => securityController.disableTwoFactor(req, res))
);
