ALTER TABLE "gallery_photos" ADD COLUMN "is_ai_caption" boolean DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE "gallery_photos" SET "is_ai_caption" = true WHERE "photo_key" IS NOT NULL;
