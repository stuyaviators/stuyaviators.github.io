"use client";

import { FormField } from "@/components/FormField";
import { type NewsletterFormData } from "@/types/email-builder";

type HeaderFormProps = {
	data: NewsletterFormData;
	onUpdate: (updates: Partial<NewsletterFormData>) => void;
};

export const HeaderForm: React.FC<HeaderFormProps> = ({ data, onUpdate }) => {
	return (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold text-ctp-text">Header Details</h2>

			<FormField
				label="Header Title"
				value={data.headerTitle}
				onChange={(value) => {
					onUpdate({ headerTitle: value });
				}}
				placeholder="e.g., StuyAviators"
				required
			/>

			<FormField
				label="Header Subtitle"
				value={data.headerSubtitle}
				onChange={(value) => {
					onUpdate({ headerSubtitle: value });
				}}
				placeholder="e.g. Stuyvesant High School's Aviation Club"
			/>

			<FormField
				label="Logo URL"
				value={data.headerLogoUrl}
				onChange={(value) => {
					onUpdate({ headerLogoUrl: value });
				}}
				placeholder="https://stuyaviators.vercel.app/stuyaviators.png"
				type="url"
			/>
		</div>
	);
};
