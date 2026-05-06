import type { Request, Response } from "express";

import type { ValidatedRequest } from "@/shared/middlewares";
import { requireRouteUser } from "@/shared/session";
import { sendSuccess } from "@/shared/utils";
import { usersService } from "./users.service";
import type { searchUsersSchema } from "./users.validation";

export class UsersController {
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
}

export const usersController = new UsersController();
