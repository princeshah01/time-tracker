import { UsersRepository } from "./users.repository";
import type {
  InvitedUserSearchRecord,
  OnboardedUserSearchRecord,
  SearchRequester,
  SuggestedUser,
} from "./users.types";
import type { SearchUsersInput } from "./users.validation";

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
    name: record.name,
    email: record.email,
    role: record.role,
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

  async searchUsers(input: SearchUsersInput, requester: SearchRequester) {
    const suggestedUsers: SuggestedUser[] = [];
    const seenEmails = new Set<string>();
    const q = input.q.trim();

    const onboardedUsers = await this.usersRepository.searchOnboardedUsers({
      q,
      limit: input.limit,
      excludeUserId: input.excludeSelf ? requester.id : undefined,
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
        suggestedUsers,
        seenEmails,
      });
    }

    return {
      suggestedUsers: suggestedUsers.slice(0, input.limit),
    };
  }

  private async appendInviteSuggestions(input: {
    q: string;
    limit: number;
    excludeEmail?: string;
    suggestedUsers: SuggestedUser[];
    seenEmails: Set<string>;
  }) {
    const invitations = await this.usersRepository.searchInvitedUsers({
      q: input.q,
      limit: input.limit * INVITATION_SEARCH_LOOKAHEAD_MULTIPLIER,
      excludeEmail: input.excludeEmail,
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
}

export const usersService = new UsersService();
