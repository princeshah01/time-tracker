import { createHash, randomBytes, randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";

import { env } from "@/env";
import { addInviteEmailJob } from "@/lib/queues/email";
import { permissionsService } from "@/modules/permissions/permissions.service";
import {
  INVITE_EXPIRY_DAYS,
  INVITE_TOKEN_BYTES,
} from "@/shared/constants/auth.constants";
import { HttpError } from "@/shared/http/http-error";
import { InvitesRepository } from "./invites.repository";

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

  async createInvite(input: {
    email: string;
    roleId: number;
    invitedBy: string;
    invitedByName?: string;
  }) {
    const email = input.email.trim().toLowerCase();
    const roleRecord = await permissionsService.getRoleById(input.roleId);

    if (!roleRecord) {
      throw new HttpError(404, "Role not found");
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

  async getInvite(token: string) {
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

  async acceptInvite(input: { token: string; name: string; password: string }) {
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
      throw new HttpError(400, "Invite token is required");
    }

    const invite = await this.invitesRepository.findInviteByTokenHash(
      hashInviteToken(token)
    );

    if (!invite) {
      throw new HttpError(404, "Invite not found");
    }

    if (invite.acceptedAt) {
      throw new HttpError(409, "Invite was already accepted");
    }

    if (invite.expiresAt.getTime() < Date.now()) {
      throw new HttpError(410, "Invite has expired");
    }

    return invite;
  }
}

export const invitesService = new InvitesService();
