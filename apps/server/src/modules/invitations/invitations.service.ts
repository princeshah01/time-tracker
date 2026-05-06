import {
  createHash,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { signJWT, verifyJWT } from "better-auth/crypto";

import { env } from "@/config";
import { addAuthOtpEmailJob, addInviteEmailJob } from "@/infrastructure/queue";
import { permissionsService } from "@/modules/permissions/permissions.service";
import { roleNames } from "@/shared/constants/role-permission";
import { AppError } from "@/shared/utils";
import { InvitationsRepository } from "./invitations.repository";
import type {
  AcceptInvitationInput,
  CreateInvitationInput,
  InvitationCookiePayload,
  InvitationStatus,
} from "./invitations.types";

const INVITATION_TOKEN_BYTES = 32;
const INVITATION_EXPIRY_DAYS = 7;
const OTP_EXPIRY_MINUTES = 5;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_SECONDS = 60;
const INVITE_COOKIE_SECONDS = 10 * 60;
export const INVITE_ACCEPT_COOKIE_NAME = "time-tracker.invite";

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function hashOtp(invitationId: number, otp: string) {
  return hashValue(`${invitationId}:${otp}`);
}

function createInvitationToken() {
  return randomBytes(INVITATION_TOKEN_BYTES).toString("base64url");
}

function createOtp() {
  return randomInt(100000, 1000000).toString();
}

function isEqualHash(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function getInvitationUrl(token: string) {
  return `${env.CLIENT_URL}/accept-invite?token=${encodeURIComponent(token)}`;
}

function getStatus(invitation: {
  acceptedAt: Date | null;
  revokedAt: Date | null;
  expiresAt: Date;
}): InvitationStatus {
  if (invitation.acceptedAt) return "accepted";
  if (invitation.revokedAt) return "revoked";
  if (invitation.expiresAt.getTime() <= Date.now()) return "expired";
  return "pending";
}

export class InvitationsService {
  constructor(
    private readonly invitationsRepository = new InvitationsRepository()
  ) {}

  async createInvitation(input: CreateInvitationInput) {
    const email = input.email.trim().toLowerCase();
    const roleRecord = await permissionsService.getRoleById(input.roleId);

    if (!roleRecord) {
      throw new AppError({
        message: "Role not found",
        code: "NOT_FOUND",
      });
    }

    if (roleRecord.name === roleNames.admin) {
      throw new AppError({
        message: "System admin role cannot be assigned by invitation",
        code: "FORBIDDEN",
      });
    }

    const activeInvitation =
      await this.invitationsRepository.findActiveInvitationByEmail(email);

    const token = createInvitationToken();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt);
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

    const invitation = activeInvitation
      ? await this.invitationsRepository.refreshPendingInvitation(
          activeInvitation.id,
          {
            roleId: input.roleId,
            tokenHash: hashValue(token),
            invitedBy: input.invitedBy,
            expiresAt,
            createdAt,
          }
        )
      : await this.invitationsRepository.createInvitation({
          email,
          roleId: input.roleId,
          tokenHash: hashValue(token),
          invitedBy: input.invitedBy,
          expiresAt,
        });

    if (!invitation) {
      throw new AppError({
        message: "Failed to save invitation",
        code: "INTERNAL_SERVER_ERROR",
        isOperational: false,
      });
    }

    const inviteUrl = getInvitationUrl(token);

    await addInviteEmailJob({
      to: email,
      inviteUrl,
      invitedByName: input.invitedByName,
    });

    return {
      id: invitation.id,
      email: invitation.email,
      role: {
        id: roleRecord.id,
        name: roleRecord.name,
        description: roleRecord.description,
      },
      status: getStatus(invitation),
      expiresAt: invitation.expiresAt,
      inviteUrl,
    };
  }

  async listInvitations(input: {
    page: number;
    limit: number;
    q?: string;
    status?: InvitationStatus;
  }) {
    const result = await this.invitationsRepository.listInvitations(input);

    return {
      items: result.items.map((invitation) => ({
        ...invitation,
        status: getStatus(invitation),
      })),
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
      hasNextPage: result.page * result.limit < result.total,
    };
  }

  async verifyInvitation(token: string) {
    const invitation = await this.assertUsableInvitationToken(token);

    return {
      id: invitation.id,
      email: invitation.email,
      role: {
        id: invitation.roleId,
        name: invitation.roleName,
        description: invitation.roleDescription,
      },
      status: getStatus(invitation),
      expiresAt: invitation.expiresAt,
    };
  }

  async sendOtp(token: string) {
    const invitation = await this.assertUsableInvitationToken(token);

    if (
      invitation.otpSentAt &&
      Date.now() - invitation.otpSentAt.getTime() < OTP_RESEND_SECONDS * 1000
    ) {
      throw new AppError({
        message: "Please wait before requesting another OTP",
        code: "TOO_MANY_REQUESTS",
      });
    }

    const otp = createOtp();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.invitationsRepository.setInvitationOtp({
      invitationId: invitation.id,
      otpHash: hashOtp(invitation.id, otp),
      otpExpiresAt,
    });

    await addAuthOtpEmailJob({
      to: invitation.email,
      otp,
      purpose: "invite",
    });

    return {
      email: invitation.email,
      expiresAt: otpExpiresAt,
    };
  }

  async verifyOtp(input: { token: string; otp: string }) {
    const invitation = await this.assertUsableInvitationToken(input.token);

    if (!invitation.otpHash || !invitation.otpExpiresAt) {
      throw new AppError({
        message: "OTP has not been requested",
        code: "BAD_REQUEST",
      });
    }

    if (invitation.otpExpiresAt.getTime() <= Date.now()) {
      throw new AppError({
        message: "OTP has expired",
        code: "UNPROCESSABLE_ENTITY",
      });
    }

    if (invitation.otpAttempts >= OTP_MAX_ATTEMPTS) {
      throw new AppError({
        message: "Too many OTP attempts",
        code: "TOO_MANY_REQUESTS",
      });
    }

    const expectedHash = hashOtp(invitation.id, input.otp);

    if (!isEqualHash(invitation.otpHash, expectedHash)) {
      await this.invitationsRepository.incrementOtpAttempts(invitation.id);
      throw new AppError({
        message: "Invalid OTP",
        code: "UNPROCESSABLE_ENTITY",
      });
    }

    await this.invitationsRepository.markOtpVerified(invitation.id);

    const inviteJwt = await signJWT(
      {
        inviteId: invitation.id,
        email: invitation.email,
        purpose: "invite-accept",
      },
      env.BETTER_AUTH_SECRET,
      INVITE_COOKIE_SECONDS
    );

    return {
      inviteJwt,
      maxAgeSeconds: INVITE_COOKIE_SECONDS,
      email: invitation.email,
    };
  }

  async acceptInvitation(input: AcceptInvitationInput) {
    const invitation = await this.assertUsableInvitationId(input.inviteId);

    if (!invitation.otpVerifiedAt) {
      throw new AppError({
        message: "Invitation OTP must be verified before acceptance",
        code: "FORBIDDEN",
      });
    }

    const roleRecord = await permissionsService.getRoleById(invitation.roleId);

    if (!roleRecord) {
      throw new AppError({
        message: "Invited role is no longer available",
        code: "CONFLICT",
      });
    }

    const passwordHash = await hashPassword(input.password);
    const acceptedUser = await this.invitationsRepository.acceptInvitation({
      invitationId: invitation.id,
      roleId: invitation.roleId,
      email: invitation.email,
      name: input.name,
      passwordHash,
    });

    if (!acceptedUser) {
      throw new AppError({
        message: "Failed to accept invitation",
        code: "CONFLICT",
      });
    }

    return {
      accepted: true,
      email: acceptedUser.email,
      userId: acceptedUser.id,
    };
  }

  async revokeInvitation(invitationId: number) {
    const existing =
      await this.invitationsRepository.findInvitationById(invitationId);

    if (!existing) {
      throw new AppError({
        message: "Invitation not found",
        code: "NOT_FOUND",
      });
    }

    if (existing.acceptedAt) {
      throw new AppError({
        message: "Accepted invitations cannot be revoked",
        code: "CONFLICT",
      });
    }

    if (existing.revokedAt) {
      return {
        ...existing,
        status: getStatus(existing),
      };
    }

    const invitation =
      await this.invitationsRepository.revokeInvitation(invitationId);

    if (!invitation) {
      throw new AppError({
        message: "Failed to revoke invitation",
        code: "CONFLICT",
      });
    }

    return {
      ...invitation,
      status: getStatus(invitation),
    };
  }

  async readInviteCookie(token?: string) {
    if (!token) {
      throw new AppError({
        message: "Verified invitation cookie is required",
        code: "UNAUTHORIZED",
      });
    }

    const payload = await verifyJWT<InvitationCookiePayload>(
      token,
      env.BETTER_AUTH_SECRET
    );

    if (!payload || payload.purpose !== "invite-accept") {
      throw new AppError({
        message: "Invalid or expired invitation cookie",
        code: "UNAUTHORIZED",
      });
    }

    return payload;
  }

  private async assertUsableInvitationToken(token: string) {
    if (!token) {
      throw new AppError({
        message: "Invitation token is required",
        code: "BAD_REQUEST",
      });
    }

    const invitation =
      await this.invitationsRepository.findInvitationByTokenHash(
        hashValue(token)
      );

    return this.assertUsableInvitation(invitation);
  }

  private async assertUsableInvitationId(invitationId: number) {
    const invitation =
      await this.invitationsRepository.findInvitationById(invitationId);

    return this.assertUsableInvitation(invitation);
  }

  private assertUsableInvitation<
    TInvitation extends {
      acceptedAt: Date | null;
      revokedAt: Date | null;
      expiresAt: Date;
    } | null,
  >(invitation: TInvitation) {
    if (!invitation) {
      throw new AppError({
        message: "Invitation not found",
        code: "NOT_FOUND",
      });
    }

    if (invitation.acceptedAt) {
      throw new AppError({
        message: "Invitation was already accepted",
        code: "CONFLICT",
      });
    }

    if (invitation.revokedAt) {
      throw new AppError({
        message: "Invitation was revoked",
        code: "FORBIDDEN",
      });
    }

    if (invitation.expiresAt.getTime() <= Date.now()) {
      throw new AppError({
        message: "Invitation has expired",
        code: "UNPROCESSABLE_ENTITY",
      });
    }

    return invitation;
  }
}

export const invitationsService = new InvitationsService();
