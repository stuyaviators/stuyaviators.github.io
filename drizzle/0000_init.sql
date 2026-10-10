CREATE TYPE "public"."listing_kind" AS ENUM('opportunity', 'scholarship');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('new', 'read', 'archived');--> statement-breakpoint
CREATE TYPE "public"."submission_type" AS ENUM('contact', 'story', 'photo', 'meeting_idea', 'mailing_list');--> statement-breakpoint
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "listing_kind" NOT NULL,
	"title" text NOT NULL,
	"organization" text NOT NULL,
	"summary" text NOT NULL,
	"description" text,
	"url" text NOT NULL,
	"image_url" text,
	"deadline" date,
	"amount" text,
	"start_date" date,
	"end_date" date,
	"location" text,
	"eligibility" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"status" "listing_status" DEFAULT 'draft' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"updated_by" text,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"window_start" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "submission_type" NOT NULL,
	"name" text,
	"email" text,
	"message" text,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "submission_status" DEFAULT 'new' NOT NULL,
	"mailing_list" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "listings_kind_status_idx" ON "listings" USING btree ("kind","status");--> statement-breakpoint
CREATE INDEX "submissions_status_idx" ON "submissions" USING btree ("status","created_at");