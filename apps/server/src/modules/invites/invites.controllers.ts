import { fromNodeHeaders } from "better-auth/node";
import type { Request, Response } from "express";

import { auth } from "@/auth";
import type { ValidatedRequest } from "@/shared/middlewares";
import { runAuthApi, sendSuccess } from "@/shared/utils";
import { invitesService } from "./invites.service";
import type {
  acceptInviteSchema,
  createInviteSchema,
  inviteTokenSchema,
} from "./invites.validation";

import { requireRouteUser } from "@/shared/session";

function appendAuthHeaders(res: Response, headers?: Headers) {
  if (!headers) {
    return;
  }

  const setCookies =
    (headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.() ??
    [];

  for (const cookie of setCookies) {
    res.append("Set-Cookie", cookie);
  }

  headers.forEach((value, key) => {
    if (key.toLowerCase() !== "set-cookie") {
      res.setHeader(key, value);
    }
  });
}

export class InvitesController {
  async create(req: Request, res: Response) {
    const user = requireRouteUser(req);
    const { body } = (req as ValidatedRequest<typeof createInviteSchema>)
      .validated;
    const invite = await invitesService.createInvite({
      ...body,
      invitedBy: user.id,
      invitedByName: user.name,
    });

    return sendSuccess({
      res,
      data: invite,
      message: "Invite created successfully",
      status: 201,
    });
  }

  async get(req: Request, res: Response) {
    const { params } = (req as ValidatedRequest<typeof inviteTokenSchema>)
      .validated;
    const invite = await invitesService.getInvite(params.token);

    return sendSuccess({
      res,
      data: invite,
      message: "Invite fetched successfully",
    });
  }

  async accept(req: Request, res: Response) {
    const { body, params } = (
      req as ValidatedRequest<typeof acceptInviteSchema>
    ).validated;
    const result = await invitesService.acceptInvite({
      token: params.token,
      ...body,
    });
    const authResult = await runAuthApi(() =>
      auth.api.signInEmail({
        headers: fromNodeHeaders(req.headers),
        body: {
          email: result.email,
          password: body.password,
        },
        returnHeaders: true,
      })
    );

    appendAuthHeaders(res, authResult.headers);

    return sendSuccess({
      res,
      data: result,
      message: "Invite accepted successfully",
    });
  }
}

export const invitesController = new InvitesController();
