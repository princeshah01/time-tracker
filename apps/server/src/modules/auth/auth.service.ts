import { AppError } from "@/shared/utils";
import { AuthRepository } from "./auth.repository";

export class AuthService {
  constructor(private readonly authRepository = new AuthRepository()) {}
  async getUserStatusByEmail(email: string) {
    return this.authRepository.findUserStatusByEmail(email);
  }
  async requireActiveUserByEmail(email: string) {
    const record = await this.authRepository.findUserStatusByEmail(email);

    if (!record) {
      throw new AppError({
        message: "No account found with the provided email.",
        code: "NOT_FOUND",
      });
    }

    if (!record.isActive) {
      throw new AppError({
        message: "Your account is inactive. Please contact an administrator.",
        code: "FORBIDDEN",
      });
    }

    return record;
  }
  async requireActiveUserById(userId: string) {
    const record = await this.authRepository.findUserStatusById(userId);

    if (!record) {
      throw new AppError({
        message: "User not found",
        code: "NOT_FOUND",
      });
    }

    if (!record.isActive) {
      throw new AppError({
        message: "Your account is inactive. Please contact an administrator.",
        code: "FORBIDDEN",
      });
    }

    return record;
  }
}

export const authService = new AuthService();
