ALTER TABLE "crew_members" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "crew_members" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "gallery_photos" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "gallery_photos" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "newsletter_presets" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "newsletter_presets" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "newsletters" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "deleted_by" text;--> statement-breakpoint
-- Admins also get the new (secret) Trash box, value 1024.
UPDATE "users" SET "permissions" = "permissions" | 1024 WHERE ("permissions" & 384) = 384;
