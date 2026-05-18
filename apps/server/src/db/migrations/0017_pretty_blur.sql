ALTER TABLE "notifications" ADD COLUMN "dedupe_key" text;--> statement-breakpoint
WITH computed_notifications AS (
	SELECT
		"id",
		"user_id",
		CASE
			WHEN "type" = 'MISSING_DAILY_LOG'
				AND "entity_type" = 'timesheet'
				AND "entity_id" IS NOT NULL
				AND "metadata" ? 'date'
				THEN concat('missing-log:', "entity_id", ':', "user_id", ':', "metadata" ->> 'date')
			WHEN "type" = 'INCOMPLETE_DAILY_LOG'
				AND "entity_type" = 'timesheet'
				AND "entity_id" IS NOT NULL
				AND "metadata" ? 'date'
				THEN concat('incomplete-log:', "entity_id", ':', "user_id", ':', "metadata" ->> 'date')
			WHEN "type" IN ('TIMESHEET_ENDING_MISSING_LOG', 'TIMESHEET_GRACE_MISSING_LOG')
				AND "entity_type" = 'timesheet'
				AND "entity_id" IS NOT NULL
				AND "metadata" ? 'date'
				THEN concat('timesheet-ending:', "entity_id", ':', "user_id", ':', "metadata" ->> 'date')
			WHEN "type" = 'TIMESHEET_ASSIGNED'
				AND "entity_type" = 'timesheet'
				AND "entity_id" IS NOT NULL
				THEN concat('timesheet-assigned:', "entity_id", ':', "user_id")
			WHEN "type" = 'PROJECT_ASSIGNED'
				AND "entity_type" = 'project'
				AND "entity_id" IS NOT NULL
				THEN concat('project-assigned:', "entity_id", ':', "user_id")
		END AS "dedupe_key"
	FROM "notifications"
),
ranked_notifications AS (
	SELECT
		"id",
		"dedupe_key",
		row_number() OVER (
			PARTITION BY "user_id", "dedupe_key"
			ORDER BY "id"
		) AS "rank"
	FROM computed_notifications
	WHERE "dedupe_key" IS NOT NULL
)
UPDATE "notifications"
SET "dedupe_key" = ranked_notifications."dedupe_key"
FROM ranked_notifications
WHERE "notifications"."id" = ranked_notifications."id"
	AND ranked_notifications."rank" = 1;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_dedupe_key_unique" UNIQUE("user_id","dedupe_key");
--> statement-breakpoint
ALTER TABLE "notification_deduplication" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notification_deliveries" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "notification_deduplication" CASCADE;--> statement-breakpoint
DROP TABLE "notification_deliveries" CASCADE;
