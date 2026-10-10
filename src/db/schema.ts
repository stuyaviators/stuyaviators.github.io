import {
	boolean,
	date,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const listingKind = pgEnum("listing_kind", ["opportunity", "scholarship"]);
export const listingStatus = pgEnum("listing_status", ["draft", "published"]);

/** Opportunities and scholarships (one table, `kind` tells them apart). */
export const listings = pgTable(
	"listings",
	{
		id: uuid().primaryKey().defaultRandom(),
		kind: listingKind().notNull(),
		title: text().notNull(),
		organization: text().notNull(),
		summary: text().notNull(),
		description: text(), // Markdown, rendered with renderMarkdown()
		url: text().notNull(),
		imageUrl: text(),
		deadline: date({ mode: "string" }),
		amount: text(), // Scholarships
		startDate: date({ mode: "string" }), // Opportunities
		endDate: date({ mode: "string" }),
		location: text(),
		eligibility: text(),
		tags: text().array().notNull().default([]),
		featured: boolean().notNull().default(false),
		status: listingStatus().notNull().default("draft"),
		sortOrder: integer().notNull().default(0),
		createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
		createdBy: text(),
		updatedBy: text(),
		deletedAt: timestamp({ withTimezone: true }),
	},
	(table) => [index("listings_kind_status_idx").on(table.kind, table.status)]
);

export const submissionType = pgEnum("submission_type", [
	"contact",
	"story",
	"photo",
	"meeting_idea",
	"mailing_list",
]);
export const submissionStatus = pgEnum("submission_status", [
	"new",
	"read",
	"archived",
]);

/** Everything the public forms collect; shown in the dashboard inbox. */
export const submissions = pgTable(
	"submissions",
	{
		id: uuid().primaryKey().defaultRandom(),
		type: submissionType().notNull(),
		name: text(),
		email: text(),
		message: text(),
		data: jsonb().$type<Record<string, string>>().notNull().default({}),
		status: submissionStatus().notNull().default("new"),
		// Result of the automatic mailing-list sign-up: submitted | skipped | failed
		mailingList: text(),
		createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [index("submissions_status_idx").on(table.status, table.createdAt)]
);

/** Fixed-window rate limiting keyed by a salted hash of IP + route. */
export const rateLimits = pgTable("rate_limits", {
	key: text().primaryKey(),
	count: integer().notNull(),
	windowStart: timestamp({ withTimezone: true }).notNull(),
});
