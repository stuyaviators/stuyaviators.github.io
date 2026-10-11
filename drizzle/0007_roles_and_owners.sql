ALTER TYPE "public"."user_role" ADD VALUE 'manager';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'contributor';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'media';--> statement-breakpoint
ALTER TABLE "crew_members" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "gallery_photos" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "testimonials" ADD COLUMN "created_by" text;