CREATE TABLE "timesheet_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"timesheet_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "timesheet_users_timesheet_id_user_id_unique" UNIQUE("timesheet_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "timesheets" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"timesheet_name" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "timesheet_users" ADD CONSTRAINT "timesheet_users_timesheet_id_timesheets_id_fk" FOREIGN KEY ("timesheet_id") REFERENCES "public"."timesheets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheet_users" ADD CONSTRAINT "timesheet_users_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "timesheet_users_timesheet_id_idx" ON "timesheet_users" USING btree ("timesheet_id");--> statement-breakpoint
CREATE INDEX "timesheet_users_user_id_idx" ON "timesheet_users" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "timesheets_project_id_idx" ON "timesheets" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "timesheets_created_by_idx" ON "timesheets" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "timesheets_range_idx" ON "timesheets" USING btree ("start_date","end_date");