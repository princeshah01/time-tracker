import { createHash, randomBytes, randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";

import { env } from "@/config";
import { addInviteEmailJob } from "@/infrastructure/queue";
import { permissionsService } from "@/modules/permissions/permissions.service";
import { AppError } from "@/shared/utils";
import { InvitesRepository } from "./invites.repository";
import type {
  AcceptedInvite,
  AcceptInviteInput,
  CreatedInvite,
  CreateInviteInput,
  InviteDetails,
} from "./invites.types";

const INVITE_TOKEN_BYTES = 32;
const INVITE_EXPIRY_DAYS = 7;

function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createInviteToken() {
  return randomBytes(INVITE_TOKEN_BYTES).toString("base64url");
}

function getInviteUrl(token: string) {
  return `${env.CLIENT_URL}/accept-invite?token=${encodeURIComponent(token)}`;
}

export class InvitesService {
  constructor(private readonly invitesRepository = new InvitesRepository()) {}

  async createInvite(input: CreateInviteInput): Promise<CreatedInvite> {
    const email = input.email.trim().toLowerCase();
    const roleRecord = await permissionsService.getRoleById(input.roleId);

    if (!roleRecord) {
      throw new AppError({
        message: "Role not found",
        code: "NOT_FOUND",
      });
    }

    const token = createInviteToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

    const invite = await this.invitesRepository.createInvite({
      email,
      roleId: input.roleId,
      tokenHash: hashInviteToken(token),
      invitedBy: input.invitedBy,
      expiresAt,
    });

    const inviteUrl = getInviteUrl(token);

    await addInviteEmailJob({
      to: email,
      inviteUrl,
      invitedByName: input.invitedByName,
    });

    return {
      id: invite.id,
      email: invite.email,
      role: {
        id: roleRecord.id,
        name: roleRecord.name,
        description: roleRecord.description,
      },
      expiresAt: invite.expiresAt,
      inviteUrl,
    };
  }

  async getInvite(token: string): Promise<InviteDetails> {
    const invite = await this.assertInviteToken(token);

    return {
      email: invite.email,
      role: {
        id: invite.roleId,
        name: invite.roleName,
        description: invite.roleDescription,
      },
      expiresAt: invite.expiresAt,
    };
  }

  async acceptInvite(input: AcceptInviteInput): Promise<AcceptedInvite> {
    const invite = await this.assertInviteToken(input.token);
    const email = invite.email.toLowerCase();
    const existingUser = await this.invitesRepository.findUserByEmail(email);
    const passwordHash = await hashPassword(input.password);

    const user =
      existingUser ??
      (await this.invitesRepository.createVerifiedUser({
        id: randomUUID(),
        email,
        name: input.name,
      }));

    if (existingUser) {
      await this.invitesRepository.markUserEmailVerified(user.id, input.name);
    }

    await this.invitesRepository.upsertCredentialAccount({
      userId: user.id,
      passwordHash,
    });

    await permissionsService.assignRoleToUser(user.id, invite.roleId);
    await this.invitesRepository.markInviteAccepted(invite.id);

    return {
      email,
      accepted: true,
    };
  }

  private async assertInviteToken(token: string) {
    if (!token) {
      throw new AppError({
        message: "Invite token is required",
        code: "BAD_REQUEST",
      });
    }

    const invite = await this.invitesRepository.findInviteByTokenHash(
      hashInviteToken(token)
    );

    if (!invite) {
      throw new AppError({
        message: "Invite not found",
        code: "NOT_FOUND",
      });
    }

    if (invite.acceptedAt) {
      throw new AppError({
        message: "Invite was already accepted",
        code: "CONFLICT",
      });
    }

    if (invite.expiresAt.getTime() < Date.now()) {
      throw new AppError({
        message: "Invite has expired",
        code: "UNPROCESSABLE_ENTITY",
      });
    }

    return invite;
  }
}

export const invitesService = new InvitesService();
