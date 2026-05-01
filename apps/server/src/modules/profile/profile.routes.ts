import { Router } from "express";

import { asyncHandler } from "@/shared/http/async-handler";
import { profileController } from "./profile.controller";

export const profileRouter = Router();

profileRouter.get(
  "/me",
  asyncHandler((req, res) => profileController.me(req, res))
);

profileRouter.patch(
  "/me",
  asyncHandler((req, res) => profileController.updateMe(req, res))
);
