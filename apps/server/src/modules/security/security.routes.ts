import { Router } from "express";

import { requireAuth, validate } from "@/shared/middlewares";
import { securityController } from "./security.controllers";
import {
  changePasswordSchema,
  setPasswordSchema,
  twoFactorPasswordSchema,
  verifyTwoFactorSchema,
} from "./security.validation";

const securityRouter = Router();

securityRouter.use(requireAuth);

securityRouter.post(
  "/change-password",
  validate(changePasswordSchema),
  securityController.changePassword
);

securityRouter.post(
  "/two-factor/setup",
  validate(twoFactorPasswordSchema),
  securityController.enableTwoFactor
);

securityRouter.post(
  "/two-factor/verify",
  validate(verifyTwoFactorSchema),
  securityController.verifyTwoFactor
);

securityRouter.post(
  "/two-factor/disable",
  validate(twoFactorPasswordSchema),
  securityController.disableTwoFactor
);

export { securityRouter };
