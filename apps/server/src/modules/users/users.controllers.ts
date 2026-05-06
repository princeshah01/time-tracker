import type { Request, Response } from "express";

import type { ValidatedRequest } from "@/shared/middlewares";
import { requireRouteUser } from "@/shared/session";
import { sendSuccess } from "@/shared/utils";
import { usersService } from "./users.service";
import type {
  listUsersSchema,
  searchUsersSchema,
  updateUserSchema,
  userIdParamSchema,
} from "./users.validation";

export class UsersController {
  async list(req: Request, res: Response) {
    const { query } = (req as ValidatedRequest<typeof listUsersSchema>)
      .validated;
    const user = requireRouteUser(req);
    const result = await usersService.listUsers(query, user.id);

    return sendSuccess({
      res,
      data: result,
      message: "Users fetched successfully",
    });
  }

  async search(req: Request, res: Response) {
    const { validated } = req as ValidatedRequest<typeof searchUsersSchema>;
    const user = requireRouteUser(req);

    const result = await usersService.searchUsers(validated.body, {
      id: user.id,
      email: user.email,
    });

    return sendSuccess({
      res,
      data: result,
      message: "User suggestions fetched successfully",
    });
  }

  async view(req: Request, res: Response) {
    const { params } = (req as ValidatedRequest<typeof userIdParamSchema>)
      .validated;
    const result = await usersService.viewUser(params.userId);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return sendSuccess({
      res,
      data: result,
      message: "User fetched successfully",
    });
  }

  async update(req: Request, res: Response) {
    const { params, body } = (req as ValidatedRequest<typeof updateUserSchema>)
      .validated;
    const result = await usersService.updateUser(params.userId, body);

    return sendSuccess({
      res,
      data: result,
      message: "User updated successfully",
    });
  }

  async sendPasswordReset(req: Request, res: Response) {
    const { params } = (req as ValidatedRequest<typeof userIdParamSchema>)
      .validated;
    const result = await usersService.sendPasswordReset(params.userId);

    return sendSuccess({
      res,
      data: result,
      message: "Password reset email sent successfully",
    });
  }
}

export const usersController = new UsersController();
