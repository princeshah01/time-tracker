CREATE TABLE "timesheet_day_leaves" (
	"id" serial PRIMARY KEY NOT NULL,
	"timesheet_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"leave_date" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "timesheet_day_leaves_timesheet_user_date_unique" UNIQUE("timesheet_id","user_id","leave_date")
);
--> statement-breakpoint
ALTER TABLE "timesheet_day_leaves" ADD CONSTRAINT "timesheet_day_leaves_timesheet_id_timesheets_id_fk" FOREIGN KEY ("timesheet_id") REFERENCES "public"."timesheets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheet_day_leaves" ADD CONSTRAINT "timesheet_day_leaves_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheet_day_leaves" ADD CONSTRAINT "timesheet_day_leaves_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "timesheet_day_leaves_timesheet_id_idx" ON "timesheet_day_leaves" USING btree ("timesheet_id");--> statement-breakpoint
CREATE INDEX "timesheet_day_leaves_user_id_idx" ON "timesheet_day_leaves" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "timesheet_day_leaves_leave_date_idx" ON "timesheet_day_leaves" USING btree ("leave_date");