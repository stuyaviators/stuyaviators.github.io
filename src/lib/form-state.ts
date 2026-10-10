export type FormState = {
	status: "idle" | "success" | "error";
	message?: string;
	fieldErrors?: Record<string, string>;
	/** Link to the real Google Form when our submission couldn't be completed. */
	fallbackUrl?: string;
	lastNameMismatch?: boolean;
	/** Whether the person was also added to the mailing list. */
	joinedMailingList?: boolean;
};

export const initialFormState: FormState = { status: "idle" };

/** Hidden field bots tend to fill in. */
export const honeypotField = "company_website";
