import type { Request, Response } from "express";

import type { ValidatedRequest } from "@/shared/middlewares";
import { requireRouteUser } from "@/shared/session";
import { sendSuccess } from "@/shared/utils";
import {
  INVITE_ACCEPT_COOKIE_NAME,
  invitationsService,
} from "./invitations.service";
import type {
  acceptInvitationSchema,
  createInvitationSchema,
  listInvitationsSchema,
  revokeInvitationSchema,
  sendInvitationOtpSchema,
  verifyInvitationOtpSchema,
  verifyInvitationSchema,
} from "./invitations.validation";

const inviteCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/api/invitations",
};

export class InvitationsController {
  async create(req: Request, res: Response) {
    const user = requireRouteUser(req);
    const { body } = (req as ValidatedRequest<typeof createInvitationSchema>)
      .validated;

    const invitation = await invitationsService.createInvitation({
      email: body.email,
      roleId: body.roleId,
      invitedBy: user.id,
      invitedByName: user.name,
    });

    return sendSuccess({
      res,
      data: invitation,
      message: "Invitation created successfully",
      status: 201,
    });
  }

  async list(req: Request, res: Response) {
    const { query } = (req as ValidatedRequest<typeof listInvitationsSchema>)
      .validated;
    const invitations = await invitationsService.listInvitations(query);

    return sendSuccess({
      res,
      data: invitations,
      message: "Invitations fetched successfully",
    });
  }

  async verify(req: Request, res: Response) {
    const { query } = (req as ValidatedRequest<typeof verifyInvitationSchema>)
      .validated;
    const invitation = await invitationsService.verifyInvitation(query.token);

    return sendSuccess({
      res,
      data: invitation,
      message: "Invitation verified successfully",
    });
  }

  async sendOtp(req: Request, res: Response) {
    const { body } = (req as ValidatedRequest<typeof sendInvitationOtpSchema>)
      .validated;
    const result = await invitationsService.sendOtp(body.token);

    return sendSuccess({
      res,
      data: result,
      message: "Invitation OTP sent successfully",
    });
  }

  async verifyOtp(req: Request, res: Response) {
    const { body } = (req as ValidatedRequest<typeof verifyInvitationOtpSchema>)
      .validated;
    const result = await invitationsService.verifyOtp(body);

    res.cookie(INVITE_ACCEPT_COOKIE_NAME, result.inviteJwt, {
      ...inviteCookieOptions,
      maxAge: result.maxAgeSeconds * 1000,
    });

    return sendSuccess({
      res,
      data: {
        email: result.email,
        verified: true,
      },
      message: "Invitation OTP verified successfully",
    });
  }

  async accept(req: Request, res: Response) {
    const { body } = (req as ValidatedRequest<typeof acceptInvitationSchema>)
      .validated;
    const payload = await invitationsService.readInviteCookie(
      req.cookies?.[INVITE_ACCEPT_COOKIE_NAME]
    );
    const result = await invitationsService.acceptInvitation({
      inviteId: payload.inviteId,
      name: body.name,
      password: body.password,
    });

    res.clearCookie(INVITE_ACCEPT_COOKIE_NAME, inviteCookieOptions);

    return sendSuccess({
      res,
      data: result,
      message: "Invitation accepted successfully",
    });
  }

  async revoke(req: Request, res: Response) {
    const { params } = (req as ValidatedRequest<typeof revokeInvitationSchema>)
      .validated;
    const invitation = await invitationsService.revokeInvitation(params.id);

    return sendSuccess({
      res,
      data: invitation,
      message: "Invitation revoked successfully",
    });
  }
}

export const invitationsController = new InvitationsController();
