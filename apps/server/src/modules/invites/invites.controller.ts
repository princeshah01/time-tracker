import { fromNodeHeaders } from "better-auth/node";
import type { Request, Response } from "express";

import { auth } from "@/auth";
import { requireAuthSession } from "@/modules/auth/auth-session";
import { permissionsService } from "@/modules/permissions/permissions.service";
import { PERMISSION_KEYS } from "@/shared/constants/auth.constants";
import { HttpError } from "@/shared/http/http-error";
import { invitesService } from "./invites.service";

function readCreateInviteBody(body: unknown) {
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "Invalid request body");
  }

  const input = body as Record<string, unknown>;

  if (typeof input.email !== "string" || !input.email.includes("@")) {
    throw new HttpError(400, "Valid email is required");
  }

  if (typeof input.roleId !== "number" || !Number.isInteger(input.roleId)) {
    throw new HttpError(400, "Role id is required");
  }

  return {
    email: input.email,
    roleId: input.roleId,
  };
}

function readAcceptInviteBody(body: unknown) {
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "Invalid request body");
  }

  const input = body as Record<string, unknown>;

  if (typeof input.name !== "string" || input.name.trim().length < 2) {
    throw new HttpError(400, "Name must be at least 2 characters");
  }

  if (typeof input.password !== "string" || input.password.length < 8) {
    throw new HttpError(400, "Password must be at least 8 characters");
  }

  return {
    name: input.name.trim(),
    password: input.password,
  };
}

function readTokenParam(token: string | string[] | undefined) {
  if (typeof token !== "string" || token.length === 0) {
    throw new HttpError(400, "Invite token is required");
  }

  return token;
}

export class InvitesController {
  async create(req: Request, res: Response) {
    const session = await requireAuthSession(req);
    await permissionsService.requirePermission(
      session.user.id,
      PERMISSION_KEYS.USER_INVITE
    );

    const body = readCreateInviteBody(req.body);
    const invite = await invitesService.createInvite({
      ...body,
      invitedBy: session.user.id,
      invitedByName: session.user.name,
    });

    return res.status(201).json(invite);
  }

  async get(req: Request, res: Response) {
    const token = readTokenParam(req.params.token);
    const invite = await invitesService.getInvite(token);

    return res.json(invite);
  }

  async accept(req: Request, res: Response) {
    const token = readTokenParam(req.params.token);
    const body = readAcceptInviteBody(req.body);
    const result = await invitesService.acceptInvite({
      token,
      ...body,
    });
    await auth.api.signInEmail({
      headers: fromNodeHeaders(req.headers),
      body: {
        email: result.email,
        password: body.password,
      },
    });

    return res.json(result);
  }
}

export const invitesController = new InvitesController();
