import { Router } from "express";

import { requireAuth, validate } from "@/shared/middlewares";
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

invitationsRouter.get(
  "/",
  requireAuth,
  validate(listInvitationsSchema),
  invitationsController.list
);
invitationsRouter.post(
  "/",
  requireAuth,
  validate(createInvitationSchema),
  invitationsController.create
);
invitationsRouter.patch(
  "/:id/revoke",
  requireAuth,
  validate(revokeInvitationSchema),
  invitationsController.revoke
);

export { invitationsRouter };
