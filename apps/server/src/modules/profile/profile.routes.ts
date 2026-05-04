import { Router } from "express";

import { requireAuth, validate } from "@/shared/middlewares";
import { profileController } from "./profile.controllers";
import { updateProfileSchema, setPasswordSchema } from "./profile.validators";
import { profileUpload } from "@/shared/utils";

const profileRouter = Router();

profileRouter.use(requireAuth);

profileRouter.get("/", profileController.me);

profileRouter.get("/avatar", profileController.getProfilePicture);

profileRouter.patch(
  "/",
  profileUpload.single("image"),
  validate(updateProfileSchema),
  profileController.updateMe
);

profileRouter.post(
  "/set-password",
  validate(setPasswordSchema),
  profileController.setPassword
);

export { profileRouter };
