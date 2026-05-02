import { fromNodeHeaders } from "better-auth/node";
import type { Request, Response } from "express";

import { auth } from "@/auth";
import type { ValidatedRequest } from "@/shared/middlewares";
import { runAuthApi, sendSuccess } from "@/shared/utils";
import type {
  changePasswordSchema,
  setPasswordSchema,
  twoFactorPasswordSchema,
  verifyTwoFactorSchema,
} from "./security.validation";

function authHeaders(req: Request) {
  return fromNodeHeaders(req.headers);
}

export class SecurityController {
  async changePassword(req: Request, res: Response) {
    const { body } = (req as ValidatedRequest<typeof changePasswordSchema>)
      .validated;
    const result = await runAuthApi(() =>
      auth.api.changePassword({
        headers: authHeaders(req),
        body: {
          currentPassword: body.currentPassword,
          newPassword: body.newPassword,
          revokeOtherSessions: body.revokeOtherSessions ?? true,
        },
      })
    );

    return sendSuccess({
      res,
      data: result,
      message: "Password changed successfully",
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

  async enableTwoFactor(req: Request, res: Response) {
    const { body } = (req as ValidatedRequest<typeof twoFactorPasswordSchema>)
      .validated;
    const result = await runAuthApi(() =>
      auth.api.enableTwoFactor({
        headers: authHeaders(req),
        body: {
          password: body.password,
        },
      })
    );

    return sendSuccess({
      res,
      data: result,
      message: "Two-factor setup started successfully",
    });
  }

  async verifyTwoFactor(req: Request, res: Response) {
    const { body } = (req as ValidatedRequest<typeof verifyTwoFactorSchema>)
      .validated;
    const result = await runAuthApi(() =>
      auth.api.verifyTOTP({
        headers: authHeaders(req),
        body: {
          code: body.code,
          trustDevice: body.trustDevice ?? true,
        },
      })
    );

    return sendSuccess({
      res,
      data: result,
      message: "Two-factor authentication verified successfully",
    });
  }

  async disableTwoFactor(req: Request, res: Response) {
    const { body } = (req as ValidatedRequest<typeof twoFactorPasswordSchema>)
      .validated;
    const result = await runAuthApi(() =>
      auth.api.disableTwoFactor({
        headers: authHeaders(req),
        body: {
          password: body.password,
        },
      })
    );

    return sendSuccess({
      res,
      data: result,
      message: "Two-factor authentication disabled successfully",
    });
  }
}

export const securityController = new SecurityController();
