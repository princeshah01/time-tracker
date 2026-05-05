ALTER TABLE "user_invites" ADD COLUMN "otp_hash" text;--> statement-breakpoint
ALTER TABLE "user_invites" ADD COLUMN "otp_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "user_invites" ADD COLUMN "otp_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "user_invites" ADD COLUMN "otp_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_invites" ADD COLUMN "otp_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "user_invites" ADD COLUMN "revoked_at" timestamp;--> statement-breakpoint
CREATE INDEX "user_invites_role_id_idx" ON "user_invites" USING btree ("role_id");--> statement-breakpoint
UPDATE "permissions" SET "key" = 'users:invite', "description" = 'users:invite' WHERE "key" = 'user:invite';--> statement-breakpoint
UPDATE "permissions" SET "key" = 'users:view', "description" = 'users:view' WHERE "key" = 'user:view';--> statement-breakpoint
UPDATE "permissions" SET "key" = 'users:manage', "description" = 'users:manage' WHERE "key" = 'user:manage';
