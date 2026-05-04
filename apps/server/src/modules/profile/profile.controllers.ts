import type { Request, Response } from "express";

import type { ValidatedRequest } from "@/shared/middlewares";
import { AppError, runAuthApi, sendSuccess, authHeaders } from "@/shared/utils";
import { profileService } from "./profile.service";
import type {
  setPasswordSchema,
  updateProfileSchema,
} from "./profile.validators";
import { requireRouteUser } from "@/shared/session";
import { auth } from "@/auth";

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
    const imagePath = req.file
      ? `/uploads/profile-images/${req.file.filename}`
      : undefined;

    const profile = await profileService.updateMe(user.id, {
      ...body,
      ...(imagePath && { image: imagePath }),
    });

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
  async setPassword(req: Request, res: Response) {
    const { body } = (req as ValidatedRequest<typeof setPasswordSchema>)
      .validated;
    const result = await runAuthApi(() =>
      auth.api.setPassword({
        headers: authHeaders(req),
        body: {
          newPassword: body.newPassword,
        },
      })
    );

    return sendSuccess({
      res,
      data: result,
      message: "Password set successfully",
    });
  }
}

export const profileController = new ProfileController();
