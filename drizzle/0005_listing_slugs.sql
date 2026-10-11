ALTER TABLE "listings" ADD COLUMN "slug" text;--> statement-breakpoint
-- Give the cards that already exist an address: the title as a slug, with the
-- start of the id added to the second and later cards that share one.
UPDATE "listings" AS l SET "slug" = s."slug" FROM (
	SELECT "id",
		CASE WHEN row_number() OVER (PARTITION BY "kind", "base" ORDER BY "created_at", "id") > 1
			THEN "base" || '-' || left("id"::text, 4)
			ELSE "base" END AS "slug"
	FROM (
		SELECT "id", "kind", "created_at",
			coalesce(
				nullif(trim(both '-' from left(lower(regexp_replace("title", '[^a-zA-Z0-9]+', '-', 'g')), 80)), ''),
				'listing'
			) AS "base"
		FROM "listings"
	) AS b
) AS s WHERE l."id" = s."id";--> statement-breakpoint
CREATE UNIQUE INDEX "listings_kind_slug_idx" ON "listings" USING btree ("kind","slug");
