import { Router } from "express";

import { requireAuth, validate, requirePermission } from "@/shared/middlewares";
import { invitationsController } from "./invitations.controllers";
import {
  acceptInvitationSchema,
  createInvitationSchema,
  listInvitationsSchema,
  revokeInvitationSchema,
  sendInvitationOtpSchema,
  verifyInvitationOtpSchema,
  verifyInvitationSchema,
} from "./invitations.validation";
import { permissionKeys } from "@/shared/constants/role-permission";

const invitationsRouter = Router();

invitationsRouter.get(
  "/verify",
  validate(verifyInvitationSchema),
  invitationsController.verify
);
invitationsRouter.post(
  "/send-otp",
  validate(sendInvitationOtpSchema),
  invitationsController.sendOtp
);
invitationsRouter.post(
  "/verify-otp",
  validate(verifyInvitationOtpSchema),
  invitationsController.verifyOtp
);
invitationsRouter.post(
  "/accept",
  validate(acceptInvitationSchema),
  invitationsController.accept
);

invitationsRouter.use(
  requireAuth,
  requirePermission(permissionKeys.userInvite)
);

invitationsRouter.get(
  "/",
  validate(listInvitationsSchema),
  invitationsController.list
);
invitationsRouter.post(
  "/",
  validate(createInvitationSchema),
  invitationsController.create
);
invitationsRouter.patch(
  "/:id/revoke",
  validate(revokeInvitationSchema),
  invitationsController.revoke
);

export { invitationsRouter };
