ALTER TABLE "timesheet_users" ADD COLUMN "verified_by" text;--> statement-breakpoint
ALTER TABLE "timesheet_users" ADD COLUMN "verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "timesheet_users" ADD CONSTRAINT "timesheet_users_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;