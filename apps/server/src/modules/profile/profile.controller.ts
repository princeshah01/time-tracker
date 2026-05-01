import type { Request, Response } from "express";

import { requireAuthSession } from "@/modules/auth/auth-session";
import { HttpError } from "@/shared/http/http-error";
import { profileService } from "./profile.service";

function readProfileUpdateBody(body: unknown) {
  if (!body || typeof body !== "object") {
    return {};
  }

  const input = body as Record<string, unknown>;
  const update: { name?: string; image?: string | null } = {};

  if (typeof input.name === "string") {
    const name = input.name.trim();
    if (name.length < 2) {
      throw new HttpError(400, "Name must be at least 2 characters");
    }
    update.name = name;
  }

  if (typeof input.image === "string" || input.image === null) {
    update.image = input.image;
  }

  return update;
}

export class ProfileController {
  async me(req: Request, res: Response) {
    const session = await requireAuthSession(req);
    const profile = await profileService.getMe(session.user.id);

    return res.json(profile);
  }

  async updateMe(req: Request, res: Response) {
    const session = await requireAuthSession(req);
    const update = readProfileUpdateBody(req.body);
    const profile = await profileService.updateMe(session.user.id, update);

    return res.json(profile);
  }
}

export const profileController = new ProfileController();
