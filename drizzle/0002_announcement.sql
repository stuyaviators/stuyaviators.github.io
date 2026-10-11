CREATE TABLE "announcement" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"text" text DEFAULT '' NOT NULL,
	"link_url" text DEFAULT '' NOT NULL,
	"link_label" text DEFAULT '' NOT NULL,
	"is_on" boolean DEFAULT false NOT NULL,
	"ends_on" date,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text
);
