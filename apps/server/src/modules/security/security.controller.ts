import { fromNodeHeaders } from "better-auth/node";
import type { Request, Response } from "express";

import { auth } from "@/auth";
import { requireAuthSession } from "@/modules/auth/auth-session";
import { HttpError } from "@/shared/http/http-error";

function requireString(body: Record<string, unknown>, key: string) {
  const value = body[key];

  if (typeof value !== "string" || value.length === 0) {
    throw new HttpError(400, `${key} is required`);
  }

  return value;
}

function readBody(body: unknown) {
  if (!body || typeof body !== "object") {
    throw new HttpError(400, "Invalid request body");
  }

  return body as Record<string, unknown>;
}

function authHeaders(req: Request) {
  return fromNodeHeaders(req.headers);
}

export class SecurityController {
  async changePassword(req: Request, res: Response) {
    await requireAuthSession(req);
    const body = readBody(req.body);
    const result = await auth.api.changePassword({
      headers: authHeaders(req),
      body: {
        currentPassword: requireString(body, "currentPassword"),
        newPassword: requireString(body, "newPassword"),
        revokeOtherSessions:
          typeof body.revokeOtherSessions === "boolean"
            ? body.revokeOtherSessions
            : true,
      },
    });

    return res.json(result);
  }

  async setPassword(req: Request, res: Response) {
    await requireAuthSession(req);
    const body = readBody(req.body);
    const result = await auth.api.setPassword({
      headers: authHeaders(req),
      body: {
        newPassword: requireString(body, "newPassword"),
      },
    });

    return res.json(result);
  }

  async enableTwoFactor(req: Request, res: Response) {
    await requireAuthSession(req);
    const body = readBody(req.body);
    const result = await auth.api.enableTwoFactor({
      headers: authHeaders(req),
      body: {
        password: requireString(body, "password"),
      },
    });

    return res.json(result);
  }

  async verifyTwoFactor(req: Request, res: Response) {
    const body = readBody(req.body);
    const result = await auth.api.verifyTOTP({
      headers: authHeaders(req),
      body: {
        code: requireString(body, "code"),
        trustDevice:
          typeof body.trustDevice === "boolean" ? body.trustDevice : true,
      },
    });

    return res.json(result);
  }

  async disableTwoFactor(req: Request, res: Response) {
    await requireAuthSession(req);
    const body = readBody(req.body);
    const result = await auth.api.disableTwoFactor({
      headers: authHeaders(req),
      body: {
        password: requireString(body, "password"),
      },
    });

    return res.json(result);
  }
}

export const securityController = new SecurityController();
