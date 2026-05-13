import { auth } from "@/auth";
import { permissionsService } from "@/modules/permissions/permissions.service";
import { AppError, runAuthApi } from "@/shared/utils";
import { UsersRepository } from "./users.repository";
import type {
  InvitedUserSearchRecord,
  OnboardedUserSearchRecord,
  SearchRequester,
  SkillUserSearchRecord,
  SuggestedUser,
} from "./users.types";
import type {
  CreateUserSalaryInput,
  ListUsersInput,
  SearchUsersInput,
  UpdateUserInput,
  UpdateUserSalaryInput,
} from "./users.validation";

const INVITATION_SEARCH_LOOKAHEAD_MULTIPLIER = 3;

function nameFromEmail(email: string) {
  return email.split("@")[0] || email;
}

function canInviteFromInvitation(invitation: InvitedUserSearchRecord) {
  if (invitation.acceptedAt) return false;
  return true;
}

function toOnboardedSuggestion(
  record: OnboardedUserSearchRecord
): SuggestedUser {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    role: record.role,
    image: record.image,
    canSendInvite: false,
  };
}

function toSkillSuggestion(input: {
  record: SkillUserSearchRecord;
  skills: string[];
}): SuggestedUser {
  return {
    id: input.record.id,
    name: input.record.name,
    email: input.record.email,
    role: input.record.role,
    image: input.record.image,
    skills: input.skills,
    canSendInvite: false,
  };
}

function toInvitedSuggestion(input: {
  invitation: InvitedUserSearchRecord;
  existingUserEmails: Set<string>;
}): SuggestedUser {
  const email = input.invitation.email;
  const emailKey = email.toLowerCase();

  return {
    name: nameFromEmail(email),
    email,
    role: input.invitation.role,
    canSendInvite:
      !input.existingUserEmails.has(emailKey) &&
      canInviteFromInvitation(input.invitation),
  };
}

export class UsersService {
  constructor(private readonly usersRepository = new UsersRepository()) {}

  async listUsers(input: ListUsersInput, currentUserId: string) {
    const maxRoleLevel =
      await permissionsService.getUserMaxRoleLevel(currentUserId);
    const result = await this.usersRepository.listUsersPaginated(
      input,
      currentUserId,
      maxRoleLevel
    );
    const skillsByUserId = await this.getSkillsByUserId(
      result.items.map((user) => user.id)
    );

    return {
      items: result.items.map((user) => ({
        ...this.toUserView(user),
        skills: skillsByUserId.get(user.id) ?? [],
      })),
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
      hasNextPage: result.page * result.limit < result.total,
    };
  }

  async viewUser(userId: string, requesterId: string) {
    const user = await this.usersRepository.findUserById(userId);

    if (
      !user ||
      !this.canAccessUserRole(
        user,
        await permissionsService.getUserMaxRoleLevel(requesterId)
      )
    ) {
      throw new AppError({
        message: "User not found",
        code: "NOT_FOUND",
      });
    }

    const skillsByUserId = await this.getSkillsByUserId([user.id]);

    return {
      ...this.toUserView(user),
      skills: skillsByUserId.get(user.id) ?? [],
    };
  }

  async updateUser(
    userId: string,
    input: UpdateUserInput,
    requesterId: string
  ) {
    const existing = await this.usersRepository.findUserById(userId);

    if (!existing) {
      throw new AppError({
        message: "User not found",
        code: "NOT_FOUND",
      });
    }

    const requesterMaxRoleLevel =
      await permissionsService.getUserMaxRoleLevel(requesterId);

    if (!this.canAccessUserRole(existing, requesterMaxRoleLevel)) {
      throw new AppError({
        message: "You cannot manage users above your role level",
        code: "FORBIDDEN",
      });
    }

    if (input.roleId !== undefined && input.roleId !== null) {
      const role = await permissionsService.getRoleById(input.roleId);

      if (!role) {
        throw new AppError({
          message: "Role not found",
          code: "NOT_FOUND",
        });
      }

      if (role.level > requesterMaxRoleLevel) {
        throw new AppError({
          message: "You cannot assign a role above your role level",
          code: "FORBIDDEN",
        });
      }
    }

    await this.usersRepository.updateUser(userId, {
      isActive: input.isActive,
      name: input.name?.trim(),
    });

    if (input.roleId !== undefined) {
      await this.usersRepository.replaceUserRole(userId, input.roleId);
    }

    if (input.skills !== undefined) {
      await this.usersRepository.replaceUserSkills(
        userId,
        this.normalizeSkills(input.skills)
      );
    }

    return this.viewUser(userId, requesterId);
  }

  async sendPasswordReset(userId: string, requesterId: string) {
    const user = await this.usersRepository.findUserById(userId);

    if (!user) {
      throw new AppError({
        message: "User not found",
        code: "NOT_FOUND",
      });
    }

    if (
      !this.canAccessUserRole(
        user,
        await permissionsService.getUserMaxRoleLevel(requesterId)
      )
    ) {
      throw new AppError({
        message: "You cannot manage users above your role level",
        code: "FORBIDDEN",
      });
    }

    if (!user.isActive) {
      throw new AppError({
        message: "Inactive users cannot receive password reset emails",
        code: "FORBIDDEN",
      });
    }

    await runAuthApi(() =>
      auth.api.requestPasswordReset({
        body: {
          email: user.email,
        },
      })
    );

    return {
      email: user.email,
      sent: true,
    };
  }

  async getUserFinancials(userId: string, requesterId: string) {
    await this.ensureCanAccessUser(userId, requesterId);
    const salaryHistory =
      await this.usersRepository.listUserSalaryHistory(userId);
    const now = new Date();
    const currentSalary =
      salaryHistory.find((salary) => salary.effectiveDate <= now) ?? null;
    const nextSalary =
      [...salaryHistory]
        .reverse()
        .find((salary) => salary.effectiveDate > now) ?? null;

    return {
      currentSalary,
      nextSalary,
      analytics: this.getSalaryAnalytics(currentSalary, nextSalary),
      salaryHistory,
    };
  }

  async createUserSalary(
    userId: string,
    input: CreateUserSalaryInput,
    requesterId: string
  ) {
    await this.ensureCanAccessUser(userId, requesterId);

    const salary = await this.usersRepository.createUserSalary({
      userId,
      salary: input.salary.toFixed(2),
      effectiveDate: input.effectiveDate,
      note: input.note?.trim() || null,
      createdBy: requesterId,
    });

    if (!salary) {
      throw new AppError({
        message: "Failed to save salary",
        code: "INTERNAL_SERVER_ERROR",
      });
    }

    return this.getUserFinancials(userId, requesterId);
  }

  async updateUserSalary(
    userId: string,
    salaryId: number,
    input: UpdateUserSalaryInput,
    requesterId: string
  ) {
    await this.ensureCanAccessUser(userId, requesterId);

    const salary = await this.usersRepository.updateUserSalary(
      salaryId,
      userId,
      {
        ...(input.salary !== undefined
          ? { salary: input.salary.toFixed(2) }
          : {}),
        ...(input.effectiveDate !== undefined
          ? { effectiveDate: input.effectiveDate }
          : {}),
        ...(input.note !== undefined
          ? { note: input.note?.trim() || null }
          : {}),
      }
    );

    if (!salary) {
      throw new AppError({
        message: "Salary record not found",
        code: "NOT_FOUND",
      });
    }

    return this.getUserFinancials(userId, requesterId);
  }

  async searchUsers(input: SearchUsersInput, requester: SearchRequester) {
    const suggestedUsers: SuggestedUser[] = [];
    const seenEmails = new Set<string>();
    const q = input.q.trim();
    const maxRoleLevel = await permissionsService.getUserMaxRoleLevel(
      requester.id
    );

    if (input.type === "skills") {
      return this.searchUsersBySkills(input, requester);
    }

    const isProjectAssignment = input.type === "project-assign";
    const onboardedUsers = await this.usersRepository.searchOnboardedUsers({
      q,
      limit: input.limit,
      excludeUserId: input.excludeSelf ? requester.id : undefined,
      activeOnly: isProjectAssignment,
      projectAssignmentRole: isProjectAssignment ? input.role : undefined,
      maxRoleLevel,
    });

    for (const user of onboardedUsers) {
      this.addSuggestion(
        suggestedUsers,
        seenEmails,
        toOnboardedSuggestion(user)
      );
    }

    if (input.type === "invite" && suggestedUsers.length < input.limit) {
      await this.appendInviteSuggestions({
        q,
        limit: input.limit,
        excludeEmail: input.excludeSelf ? requester.email : undefined,
        maxRoleLevel,
        suggestedUsers,
        seenEmails,
      });
    }

    return {
      suggestedUsers: suggestedUsers.slice(0, input.limit),
    };
  }

  private async searchUsersBySkills(
    input: SearchUsersInput,
    requester: SearchRequester
  ) {
    const records = await this.usersRepository.searchUsersBySkills({
      q: input.q.trim(),
      limit: input.limit,
      excludeUserId: input.excludeSelf ? requester.id : undefined,
      maxRoleLevel: await permissionsService.getUserMaxRoleLevel(requester.id),
    });
    const userIds = [...new Set(records.map((record) => record.id))];
    const skillsByUserId = await this.getSkillsByUserId(userIds);
    const suggestions: SuggestedUser[] = [];
    const seenUserIds = new Set<string>();

    for (const record of records) {
      if (seenUserIds.has(record.id)) continue;

      seenUserIds.add(record.id);
      suggestions.push(
        toSkillSuggestion({
          record,
          skills: skillsByUserId.get(record.id) ?? [],
        })
      );
    }

    return {
      suggestedUsers: suggestions.slice(0, input.limit),
    };
  }

  private async appendInviteSuggestions(input: {
    q: string;
    limit: number;
    excludeEmail?: string;
    maxRoleLevel: number;
    suggestedUsers: SuggestedUser[];
    seenEmails: Set<string>;
  }) {
    const invitations = await this.usersRepository.searchInvitedUsers({
      q: input.q,
      limit: input.limit * INVITATION_SEARCH_LOOKAHEAD_MULTIPLIER,
      excludeEmail: input.excludeEmail,
      maxRoleLevel: input.maxRoleLevel,
    });
    const invitationEmails = this.getUnseenInvitationEmails(
      invitations,
      input.seenEmails
    );
    const existingUserEmails =
      await this.getExistingUserEmailSet(invitationEmails);

    for (const invitation of invitations) {
      this.addSuggestion(
        input.suggestedUsers,
        input.seenEmails,
        toInvitedSuggestion({ invitation, existingUserEmails })
      );

      if (input.suggestedUsers.length >= input.limit) break;
    }
  }

  private addSuggestion(
    suggestions: SuggestedUser[],
    seenEmails: Set<string>,
    suggestion: SuggestedUser
  ) {
    const emailKey = suggestion.email.toLowerCase();

    if (seenEmails.has(emailKey)) return;

    seenEmails.add(emailKey);
    suggestions.push(suggestion);
  }

  private getUnseenInvitationEmails(
    invitations: InvitedUserSearchRecord[],
    seenEmails: Set<string>
  ) {
    return [
      ...new Set(
        invitations
          .map((invitation) => invitation.email.toLowerCase())
          .filter((email) => !seenEmails.has(email))
      ),
    ];
  }

  private async getExistingUserEmailSet(emails: string[]) {
    const users = await this.usersRepository.findExistingUserEmails(emails);

    return new Set(users.map((record) => record.email.toLowerCase()));
  }

  private async getSkillsByUserId(userIds: string[]) {
    const skills = await this.usersRepository.listSkillsByUserIds(userIds);
    const skillsByUserId = new Map<string, string[]>();

    for (const skill of skills) {
      const existing = skillsByUserId.get(skill.userId) ?? [];
      existing.push(skill.name);
      skillsByUserId.set(skill.userId, existing);
    }

    return skillsByUserId;
  }

  private async ensureCanAccessUser(userId: string, requesterId: string) {
    const user = await this.usersRepository.findUserById(userId);

    if (
      !user ||
      !this.canAccessUserRole(
        user,
        await permissionsService.getUserMaxRoleLevel(requesterId)
      )
    ) {
      throw new AppError({
        message: "User not found",
        code: "NOT_FOUND",
      });
    }

    return user;
  }

  private getSalaryAnalytics(
    currentSalary: { salary: string } | null,
    nextSalary: { salary: string } | null
  ) {
    if (!currentSalary || !nextSalary) {
      return {
        hikeAmount: null,
        hikePercentage: null,
      };
    }

    const currentAmount = Number(currentSalary.salary);
    const nextAmount = Number(nextSalary.salary);
    const hikeAmount = nextAmount - currentAmount;

    return {
      hikeAmount: hikeAmount.toFixed(2),
      hikePercentage:
        currentAmount > 0
          ? ((hikeAmount / currentAmount) * 100).toFixed(2)
          : null,
    };
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

  private toUserView<
    TUser extends {
      role: {
        id: number | null;
        name: string | null;
        level?: number | null;
      } | null;
    },
  >(user: TUser) {
    return {
      ...user,
      roleId: user.role?.id ?? null,
      roleName: user.role?.name ?? null,
    };
  }

  private canAccessUserRole<
    TUser extends { role: { level?: number | null } | null },
  >(user: TUser, maxRoleLevel: number) {
    return (user.role?.level ?? 0) <= maxRoleLevel;
  }
}

export const usersService = new UsersService();
