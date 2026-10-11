import type { Database } from "@/db";
import { submissions } from "@/db/schema";
import { and, count, desc, eq, inArray } from "drizzle-orm";

/*
 * The submissions inbox: everything visitors send through the site forms.
 * Rows are never deleted from here; "archived" hides them from the default
 * view.
 */

export type Submission = typeof submissions.$inferSelect;
export type SubmissionType = Submission["type"];
export type SubmissionStatus = Submission["status"];

export const submissionTypes = [
	"contact",
	"story",
	"photo",
	"meeting_idea",
	"mailing_list",
] as const satisfies SubmissionType[];

export const submissionStatuses = [
	"new",
	"read",
	"archived",
] as const satisfies SubmissionStatus[];

export const typeLabels: Record<SubmissionType, string> = {
	contact: "Contact",
	story: "Story",
	photo: "Photo",
	meeting_idea: "Meeting idea",
	mailing_list: "Mailing list",
};

export type InboxFilter = {
	readonly type?: SubmissionType;
	// "open" is new + read, the default view.
	readonly status?: SubmissionStatus | "open";
};

const pageSize = 100;

export async function listSubmissions(
	db: Database,
	filter: InboxFilter = {}
): Promise<Submission[]> {
	const status = filter.status ?? "open";
	return db
		.select()
		.from(submissions)
		.where(
			and(
				filter.type === undefined
					? undefined
					: eq(submissions.type, filter.type),
				status === "open"
					? inArray(submissions.status, ["new", "read"])
					: eq(submissions.status, status)
			)
		)
		.orderBy(desc(submissions.createdAt))
		.limit(pageSize);
}

export async function countNewSubmissions(db: Database): Promise<number> {
	const rows = await db
		.select({ total: count() })
		.from(submissions)
		.where(eq(submissions.status, "new"));
	return rows.at(0)?.total ?? 0;
}

/**
The updated submission, or undefined when it no longer exists.
*/
export async function setSubmissionStatus(
	db: Database,
	id: string,
	status: SubmissionStatus
): Promise<Submission | undefined> {
	const rows = await db
		.update(submissions)
		.set({ status })
		.where(eq(submissions.id, id))
		.returning();
	return rows.at(0);
}
