CREATE TABLE "club_meetings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"code" text,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"room" text,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"description" text,
	"link_url" text,
	"link_label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"updated_by" text,
	"deleted_at" timestamp with time zone,
	"deleted_by" text
);
--> statement-breakpoint
CREATE INDEX "club_meetings_starts_idx" ON "club_meetings" USING btree ("starts_at");--> statement-breakpoint
-- Admins, Officers and Managers also get the new Meetings box, value 2048.
UPDATE "users" SET "permissions" = "permissions" | 2048 WHERE "permissions" IN (2047, 623, 103);
