import type { Request, Response } from "express";

import type { ValidatedRequest } from "@/shared/middlewares";
import { requireRouteUser } from "@/shared/session";
import { sendSuccess } from "@/shared/utils";
import { usersService } from "./users.service";
import type {
  createUserSalarySchema,
  listUsersSchema,
  searchUsersSchema,
  updateUserSalarySchema,
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
    const user = requireRouteUser(req);
    const result = await usersService.viewUser(params.userId, user.id);
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
    const user = requireRouteUser(req);
    const result = await usersService.updateUser(params.userId, body, user.id);

    return sendSuccess({
      res,
      data: result,
      message: "User updated successfully",
    });
  }

  async sendPasswordReset(req: Request, res: Response) {
    const { params } = (req as ValidatedRequest<typeof userIdParamSchema>)
      .validated;
    const user = requireRouteUser(req);
    const result = await usersService.sendPasswordReset(params.userId, user.id);

    return sendSuccess({
      res,
      data: result,
      message: "Password reset email sent successfully",
    });
  }

  async getFinancials(req: Request, res: Response) {
    const { params } = (req as ValidatedRequest<typeof userIdParamSchema>)
      .validated;
    const user = requireRouteUser(req);
    const result = await usersService.getUserFinancials(params.userId, user.id);

    return sendSuccess({
      res,
      data: result,
      message: "User financial data fetched successfully",
    });
  }

  async createSalary(req: Request, res: Response) {
    const { params, body } = (
      req as ValidatedRequest<typeof createUserSalarySchema>
    ).validated;
    const user = requireRouteUser(req);
    const result = await usersService.createUserSalary(
      params.userId,
      body,
      user.id
    );

    return sendSuccess({
      res,
      data: result,
      message: "User salary saved successfully",
      status: 201,
    });
  }

  async updateSalary(req: Request, res: Response) {
    const { params, body } = (
      req as ValidatedRequest<typeof updateUserSalarySchema>
    ).validated;
    const user = requireRouteUser(req);
    const result = await usersService.updateUserSalary(
      params.userId,
      params.salaryId,
      body,
      user.id
    );

    return sendSuccess({
      res,
      data: result,
      message: "User salary updated successfully",
    });
  }
}

export const usersController = new UsersController();
