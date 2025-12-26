"use client";

import { FormField } from "@/components/FormField";
import { type NewsletterFormData } from "@/types/email-builder";

type IntroFormProps = {
	data: NewsletterFormData;
	onUpdate: (updates: Partial<NewsletterFormData>) => void;
};

export const IntroForm: React.FC<IntroFormProps> = ({ data, onUpdate }) => {
	return (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold text-ctp-text">Intro Section</h2>

			<FormField
				label="Intro Heading"
				value={data.introHeading}
				onChange={(value) => {
					onUpdate({ introHeading: value });
				}}
				placeholder="e.g. January Newsletter"
				required
			/>

			<FormField
				label="Intro Text"
				value={data.introText}
				onChange={(value) => {
					onUpdate({ introText: value });
				}}
				placeholder="highlights or som idk much abt newsletters"
				type="textarea"
				required
			/>
		</div>
	);
};
