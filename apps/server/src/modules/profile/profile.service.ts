import { permissionsService } from "@/modules/permissions/permissions.service";
import { AppError } from "@/shared/utils";
import { ProfileRepository } from "./profile.repository";
import type { ProfileMe, UpdateProfileInput } from "./profile.types";

export class ProfileService {
  constructor(private readonly profileRepository = new ProfileRepository()) {}

  async getMe(userId: string): Promise<ProfileMe> {
    const [user, accounts, authorization] = await Promise.all([
      this.profileRepository.findUserById(userId),
      this.profileRepository.findUserAccounts(userId),
      permissionsService.getUserAuthorization(userId),
    ]);

    if (!user) {
      throw new AppError({
        message: "User not found",
        code: "NOT_FOUND",
      });
    }

    return {
      userInfo: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        hasPassword: accounts.some(
          (account) =>
            account.providerId === "credential" && Boolean(account.password)
        ),
        hasMicrosoftAccount: accounts.some(
          (account) => account.providerId === "microsoft"
        ),
      },
      role: authorization.role,
      permissions: authorization.permissions,
    };
  }

  async updateMe(
    userId: string,
    input: UpdateProfileInput
  ): Promise<ProfileMe> {
    const hasUpdateData = input.name !== undefined || input.image !== undefined;

    if (!hasUpdateData) {
      throw new AppError({
        message: "No profile fields provided for update",
        code: "BAD_REQUEST",
      });
    }

    const updatedUser = await this.profileRepository.updateUserProfile(
      userId,
      input
    );

    if (!updatedUser) {
      throw new AppError({
        message: "User not found",
        code: "NOT_FOUND",
      });
    }

    return this.getMe(userId);
  }
}

export const profileService = new ProfileService();
