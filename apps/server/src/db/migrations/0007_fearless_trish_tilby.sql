CREATE TABLE "user_salary_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"salary" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"effective_date" timestamp NOT NULL,
	"note" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_salary_history" ADD CONSTRAINT "user_salary_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_salary_history" ADD CONSTRAINT "user_salary_history_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_salary_history_user_id_idx" ON "user_salary_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_salary_history_effective_date_idx" ON "user_salary_history" USING btree ("effective_date");