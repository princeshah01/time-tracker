import type { Request, Response } from "express";

import type { ValidatedRequest } from "@/shared/middlewares";
import { AppError, sendSuccess } from "@/shared/utils";
import { profileService } from "./profile.service";
import type { updateProfileSchema } from "./profile.validators";

function requireRouteUser(req: Request) {
  if (!req.user) {
    throw new AppError({
      message: "Please log in to access this resource.",
      code: "UNAUTHORIZED",
    });
  }

  return req.user;
}

export class ProfileController {
  async me(req: Request, res: Response) {
    const user = requireRouteUser(req);
    const profile = await profileService.getMe(user.id);

    if (!profile) {
      throw new AppError({
        message: "Profile not found",
        code: "NOT_FOUND",
      });
    }

    return sendSuccess({
      res,
      message: "Profile fetched successfully",
      data: profile,
    });
  }

  async updateMe(req: Request, res: Response) {
    const user = requireRouteUser(req);
    const { body } = (req as ValidatedRequest<typeof updateProfileSchema>)
      .validated;
    const profile = await profileService.updateMe(user.id, body);

    return sendSuccess({
      res,
      message: "Profile updated successfully",
      data: profile,
    });
  }
}

export const profileController = new ProfileController();
