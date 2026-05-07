ALTER TABLE "roles" ADD COLUMN "level" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE "roles"
SET "level" = CASE "name"
	WHEN 'system-admin' THEN 100
	WHEN 'manager' THEN 80
	WHEN 'teamlead' THEN 60
	WHEN 'developer' THEN 40
	WHEN 'guest' THEN 10
	ELSE "level"
END;
