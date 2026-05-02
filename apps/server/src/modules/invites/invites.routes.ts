import { Router } from "express";

import { permissionKeys } from "@/shared/constants/role-permission";
import { requireAuth, requirePermission, validate } from "@/shared/middlewares";
import { invitesController } from "./invites.controllers";
import {
  acceptInviteSchema,
  createInviteSchema,
  inviteTokenSchema,
} from "./invites.validation";

const invitesRouter = Router();

invitesRouter.post(
  "/",
  requireAuth,
  requirePermission(permissionKeys.userInvite),
  validate(createInviteSchema),
  invitesController.create
);

invitesRouter.get(
  "/:token",
  validate(inviteTokenSchema),
  invitesController.get
);

invitesRouter.post(
  "/:token/accept",
  validate(acceptInviteSchema),
  invitesController.accept
);

export { invitesRouter };
