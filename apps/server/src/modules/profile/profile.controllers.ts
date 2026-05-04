import type { Request, Response } from "express";

import type { ValidatedRequest } from "@/shared/middlewares";
import { AppError, sendSuccess } from "@/shared/utils";
import { profileService } from "./profile.service";
import type { updateProfileSchema } from "./profile.validators";
import { requireRouteUser } from "@/shared/session";

export class ProfileController {
  async me(req: Request, res: Response) {
    const user = requireRouteUser(req);
    const profile = await profileService.getMe(user.id);
    // Simulate some delay to show loading state on frontend
    await new Promise((resolve) => setTimeout(resolve, 50_00));

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
  async getProfilePicture(req: Request, res: Response) {
    const user = requireRouteUser(req);

    const profile = await profileService.getProfilePicture(user.id);

    if (!profile) {
      return res.status(404).json({
        message: "Profile picture not found",
      });
    }

    if (profile.hasLocalImage && profile.url) {
      return res.redirect(profile.url);
    }

    if (profile.hasMicrosoftImage && profile.accessToken) {
      const response = await fetch(
        "https://graph.microsoft.com/v1.0/me/photo/$value",
        {
          headers: {
            Authorization: `Bearer ${profile.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        return res.status(404).json({
          message: "Profile picture not found",
        });
      }

      const contentType = response.headers.get("content-type") ?? "image/jpeg";

      const buffer = Buffer.from(await response.arrayBuffer());

      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "private, max-age=3600");

      return res.send(buffer);
    }

    return res.status(404).json({
      message: "Profile picture not found",
    });
  }
}

export const profileController = new ProfileController();
