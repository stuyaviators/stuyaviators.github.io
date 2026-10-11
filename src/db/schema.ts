import type { NewsletterData } from "../lib/newsletter/types.ts";
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
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

export const listingKind = pgEnum("listing_kind", [
	"opportunity",
	"scholarship",
]);
export const listingStatus = pgEnum("listing_status", ["draft", "published"]);

/**
Opportunities and scholarships (one table, `kind` tells them apart).
*/
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

/**
Everything the public forms collect; shown in the dashboard inbox.
*/
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

/**
Fixed-window rate limiting keyed by a salted hash of IP + route.
*/
export const rateLimits = pgTable("rate_limits", {
	key: text().primaryKey(),
	count: integer().notNull(),
	windowStart: timestamp({ withTimezone: true }).notNull(),
});

export const userRole = pgEnum("user_role", ["admin", "officer"]);

/**
The dashboard allowlist. Signing in with Google only works for emails here.
*/
export const users = pgTable(
	"users",
	{
		id: uuid().primaryKey().defaultRandom(),
		email: text().notNull(), // Always stored lowercased
		name: text(),
		image: text(),
		role: userRole().notNull().default("officer"),
		addedBy: text(),
		createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
		lastSignInAt: timestamp({ withTimezone: true }),
	},
	(table) => [uniqueIndex("users_email_idx").on(table.email)]
);

/**
Key–value settings. Secret values (the Epsilon token) are encrypted with
AUTH_SECRET before they're stored; see src/lib/crypto.ts.
*/
export const settings = pgTable("settings", {
	key: text().primaryKey(),
	value: text().notNull(),
	updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	updatedBy: text(),
});

export const newsletterStatus = pgEnum("newsletter_status", [
	"draft",
	"published",
]);

/**
Newsletter drafts, shared by every officer. Publishing copies the draft into
`published` so later edits don't change the public web version until it's
published again.
*/
export const newsletters = pgTable(
	"newsletters",
	{
		id: uuid().primaryKey().defaultRandom(),
		title: text().notNull(),
		slug: text(),
		data: jsonb().$type<NewsletterData>().notNull(),
		published: jsonb().$type<NewsletterData>(),
		status: newsletterStatus().notNull().default("draft"),
		publishedAt: timestamp({ withTimezone: true }),
		createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
		createdBy: text(),
		updatedBy: text(),
		deletedAt: timestamp({ withTimezone: true }),
	},
	(table) => [uniqueIndex("newsletters_slug_idx").on(table.slug)]
);

/**
Reusable starting points for newsletters ("Monthly update", "Deadline digest").
*/
export const newsletterPresets = pgTable("newsletter_presets", {
	id: uuid().primaryKey().defaultRandom(),
	name: text().notNull(),
	data: jsonb().$type<NewsletterData>().notNull(),
	createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	createdBy: text(),
});

/**
The site-wide announcement banner. A single row (id is always 1).
*/
export const announcement = pgTable("announcement", {
	id: integer().primaryKey().default(1),
	text: text().notNull().default(""),
	linkUrl: text().notNull().default(""),
	linkLabel: text().notNull().default(""),
	isOn: boolean().notNull().default(false),
	// Last day it shows, in New York time. Empty means no end.
	endsOn: date({ mode: "string" }),
	updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	updatedBy: text(),
});

/**
The flight crew page. `groupId` matches a group in src/content/crew.ts (the
group titles and intros stay there). Photos are an uploaded `imageUrl`, or
`photoKey` for the bundled photos of people imported from that file.
*/
export const crewMembers = pgTable(
	"crew_members",
	{
		id: uuid().primaryKey().defaultRandom(),
		groupId: text().notNull(),
		name: text().notNull(),
		classOf: text(),
		role: text().notNull(),
		imageUrl: text(),
		photoKey: text(),
		sortOrder: integer().notNull().default(0),
		createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
		updatedBy: text(),
	},
	(table) => [
		index("crew_members_group_idx").on(table.groupId, table.sortOrder),
	]
);
