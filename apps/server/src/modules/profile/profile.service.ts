import { env } from "@/config";
import { permissionsService } from "@/modules/permissions/permissions.service";
import { AppError } from "@/shared/utils";
import { ProfileRepository } from "./profile.repository";
import type { ProfileMe, UpdateProfileInput } from "./profile.types";

export class ProfileService {
  constructor(private readonly profileRepository = new ProfileRepository()) {}

  async getMe(userId: string): Promise<ProfileMe> {
    const [user, accounts, authorization, skills] = await Promise.all([
      this.profileRepository.findUserById(userId),
      this.profileRepository.findUserAccounts(userId),
      permissionsService.getUserAuthorization(userId),
      this.profileRepository.listSkillsByUserId(userId),
    ]);

    if (!user) {
      throw new AppError({
        message: "User not found",
        code: "NOT_FOUND",
      });
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: `${env.BETTER_AUTH_URL}/api/me/avatar`,
        skills: skills.map((skill) => skill.name),
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
    const hasUpdateData =
      input.name !== undefined ||
      input.image !== undefined ||
      input.skills !== undefined;

    if (!hasUpdateData) {
      throw new AppError({
        message: "No profile fields provided for update",
        code: "BAD_REQUEST",
      });
    }

    await Promise.all([
      this.profileRepository.updateUserProfile(userId, input),
      input.skills !== undefined
        ? this.profileRepository.replaceUserSkills(
            userId,
            this.normalizeSkills(input.skills)
          )
        : Promise.resolve(),
    ]);

    return this.getMe(userId);
  }

  private normalizeSkills(skills: string[]) {
    return [
      ...new Set(
        skills
          .map((skill) => skill.trim().toLowerCase())
          .filter((skill) => skill.length > 0)
      ),
    ];
  }

  async getProfilePicture(userId: string): Promise<{
    url?: string;
    hasLocalImage?: boolean;
    hasMicrosoftImage?: boolean;
    accessToken?: string | null;
  } | null> {
    const user = await this.profileRepository.findUserById(userId);

    if (!user) {
      throw new AppError({
        message: "User not found",
        code: "NOT_FOUND",
      });
    }
    if (user.image) {
      return {
        url: `${env.BETTER_AUTH_URL}${user.image}`,
        hasLocalImage: true,
      };
    }
    const microsoftAccount = await this.profileRepository
      .findUserAccounts(userId)
      .then((accounts) =>
        accounts.find((account) => account.providerId === "microsoft")
      );

    if (microsoftAccount?.accessToken) {
      return {
        hasMicrosoftImage: true,
        accessToken: microsoftAccount.accessToken,
      };
    }

    return null;
  }
}

export const profileService = new ProfileService();
