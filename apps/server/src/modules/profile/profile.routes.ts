import { Router } from "express";

import { requireAuth, validate } from "@/shared/middlewares";
import { profileController } from "./profile.controllers";
import { updateProfileSchema } from "./profile.validators";

const profileRouter = Router();

profileRouter.use(requireAuth);

profileRouter.get("/", profileController.me);

profileRouter.get("/avatar", profileController.getProfilePicture);

profileRouter.patch(
  "/",
  validate(updateProfileSchema),
  profileController.updateMe
);

export { profileRouter };
