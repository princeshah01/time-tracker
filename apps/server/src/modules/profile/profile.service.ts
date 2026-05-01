import { permissionsService } from "@/modules/permissions/permissions.service";
import { HttpError } from "@/shared/http/http-error";
import { ProfileRepository } from "./profile.repository";

export type ProfileMe = {
  userInfo: {
    id: string;
    email: string;
    name: string;
    image: string | null;
    emailVerified: boolean;
    twoFactorEnabled: boolean;
    hasPassword: boolean;
    hasMicrosoftAccount: boolean;
  };
  role: {
    id: number;
    name: string;
    description: string | null;
  } | null;
  permissions: string[];
};

export class ProfileService {
  constructor(private readonly profileRepository = new ProfileRepository()) {}

  async getMe(userId: string): Promise<ProfileMe> {
    const [user, accounts, authorization] = await Promise.all([
      this.profileRepository.findUserById(userId),
      this.profileRepository.findUserAccounts(userId),
      permissionsService.getUserAuthorization(userId),
    ]);

    if (!user) {
      throw new HttpError(404, "User not found");
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
          (account) => account.providerId === "credential" && account.password
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
    input: { name?: string; image?: string | null }
  ) {
    const updatedUser = await this.profileRepository.updateUserProfile(
      userId,
      input
    );

    if (!updatedUser) {
      throw new HttpError(404, "User not found");
    }

    return this.getMe(userId);
  }
}

export const profileService = new ProfileService();
