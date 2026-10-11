ALTER TYPE "public"."user_role" ADD VALUE 'custom';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "permissions" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
-- Give everyone already on the list the boxes their role had.
UPDATE "users" SET "permissions" = CASE "role"
	WHEN 'admin' THEN 1023
	WHEN 'officer' THEN 639
	WHEN 'manager' THEN 224
	WHEN 'contributor' THEN 3
	WHEN 'media' THEN 28
	ELSE 0
END;
