import { Router } from "express";

import { requireAuth, validate } from "@/shared/middlewares";
import { profileController } from "./profile.controllers";
import { updateProfileSchema } from "./profile.validators";

const profileRouter = Router();

profileRouter.use(requireAuth);

profileRouter.get("/me", profileController.me);

profileRouter.patch(
  "/me",
  validate(updateProfileSchema),
  profileController.updateMe
);

export { profileRouter };
