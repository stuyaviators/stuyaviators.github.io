"use client";

import type { NewsletterFormData } from "@/types/email-builder";
import type { Preset } from "./utils/storage";
import { GlassButton } from "@/components/GlassButton";
import { useEffect, useState } from "react";
import { ArticlesSection } from "./components/ArticlesSection";
import { HeaderForm } from "./components/HeaderForm";
import { IntroForm } from "./components/IntroForm";
import { PreviewPanel } from "./components/PreviewPanel";
import {
	clearFormData,
	defaultFormData,
	deletePreset,
	loadFormData,
	loadPresets,
	saveFormData,
	savePreset,
} from "./utils/storage";

export default function EmailBuilderPage() {
	const [formData, setFormData] = useState<NewsletterFormData>(defaultFormData);
	const [presets, setPresets] = useState<Preset[]>([]);
	const [showPresetModal, setShowPresetModal] = useState(false);
	const [presetName, setPresetName] = useState("");
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadedData = loadFormData();
		const loadedPresets = loadPresets();
		setFormData(loadedData);
		setPresets(loadedPresets);
		setIsLoading(false);
	}, []);

	// Auto-save form data
	useEffect(() => {
		if (!isLoading) {
			saveFormData(formData);
		}
	}, [formData, isLoading]);

	const handleUpdateForm = (updates: Partial<NewsletterFormData>) => {
		setFormData((previous) => ({ ...previous, ...updates }));
	};

	const handleReorderArticles = (fromIndex: number, toIndex: number) => {
		setFormData((previous) => {
			const newArticles = [...previous.articles];
			const [moved] = newArticles.splice(fromIndex, 1);
			newArticles.splice(toIndex, 0, moved);
			return { ...previous, articles: newArticles };
		});
	};

	const handleSavePreset = () => {
		if (presetName.trim()) {
			savePreset(presetName, formData);
			const updatedPresets = loadPresets();
			setPresets(updatedPresets);
			setPresetName("");
			setShowPresetModal(false);
		}
	};

	const handleLoadPreset = (selectedPreset: Preset) => {
		setFormData(selectedPreset.data);
	};

	const handleDeletePreset = (presetId: string) => {
		deletePreset(presetId);
		const updatedPresets = loadPresets();
		setPresets(updatedPresets);
	};

	const handleResetForm = () => {
		// Temporary, might create custom component
		// eslint-disable-next-line no-alert
		if (globalThis.confirm("Are you sure you want to reset the form?")) {
			clearFormData();
			setFormData(defaultFormData);
		}
	};

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-ctp-overlay1 border-t-ctp-blue" />
			</div>
		);
	}

	return (
		<main className="min-h-screen bg-linear-to-br from-ctp-base via-ctp-crust to-ctp-base px-4 py-8 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-ctp-text">
						Newsletter Builder
					</h1>
				</div>

				{/* Action Buttons */}
				<div className="mb-6 flex flex-wrap gap-3">
					<GlassButton
						onClick={() => {
							setShowPresetModal(true);
						}}
						variant="primary"
					>
						Save as Preset
					</GlassButton>
					<GlassButton onClick={handleResetForm} variant="danger">
						Reset
					</GlassButton>
				</div>

				{/* Presets Section */}
				{presets.length > 0 && (
					<div className="mb-6 rounded-lg border border-ctp-overlay1/40 bg-linear-to-br from-ctp-surface0/60 via-ctp-base/50 to-ctp-surface0/40 p-4 backdrop-blur-lg sm:p-6">
						<h2 className="mb-3 text-lg font-semibold text-ctp-text">
							Presets
						</h2>
						<div className="flex flex-wrap gap-2">
							{presets.map((preset) => (
								<div key={preset.id} className="group relative">
									<button
										type="button"
										onClick={() => {
											handleLoadPreset(preset);
										}}
										className="rounded-lg border border-ctp-overlay1/40 bg-ctp-surface1/60 px-3 py-2 text-sm font-medium text-ctp-text shadow-[0px_6px_12px_rgba(0,0,0,0.18)] transition duration-150 hover:-translate-y-px hover:border-ctp-blue/60 hover:bg-ctp-surface1/90 hover:text-ctp-blue hover:shadow-[0px_10px_18px_rgba(0,0,0,0.22)]"
										title={`Load preset: ${preset.name}`}
									>
										{preset.name}
									</button>
									<button
										type="button"
										onClick={() => {
											handleDeletePreset(preset.id);
										}}
										className="absolute -right-2 -top-2 hidden h-6 w-6 items-center justify-center rounded-full border border-ctp-red/40 bg-ctp-red/20 text-ctp-red transition duration-150 group-hover:flex"
										title={`Delete preset: ${preset.name}`}
									>
										×
									</button>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Form */}
				<div className="grid gap-6 lg:grid-cols-2">
					<div className="space-y-6 overflow-y-auto rounded-lg border border-ctp-overlay1/40 bg-linear-to-br from-ctp-surface0/60 via-ctp-base/50 to-ctp-surface0/40 p-4 backdrop-blur-lg sm:p-6 lg:max-h-[calc(100vh-300px)]">
						<HeaderForm data={formData} onUpdate={handleUpdateForm} />
						<hr className="border-ctp-overlay1/30" />
						<IntroForm data={formData} onUpdate={handleUpdateForm} />
						<hr className="border-ctp-overlay1/30" />
						<ArticlesSection data={formData} onUpdate={handleUpdateForm} />
					</div>

					{/* Preview Section */}
					<div className="lg:max-h-[calc(100vh-300px)]">
						<PreviewPanel
							data={formData}
							onReorderArticles={handleReorderArticles}
						/>
					</div>
				</div>
			</div>

			{/* Preset Modal */}
			{showPresetModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
					<div className="w-full max-w-sm rounded-lg border border-ctp-overlay1/40 bg-ctp-base p-6 shadow-xl">
						<h2 className="mb-4 text-xl font-bold text-ctp-text">
							Save as Preset
						</h2>
						<input
							type="text"
							value={presetName}
							onChange={(event) => {
								setPresetName(event.target.value);
							}}
							placeholder="Preset name (e.g., December Newsletter)"
							className="mb-4 w-full rounded-lg border border-ctp-overlay1/40 bg-ctp-surface1/40 px-3 py-2 text-ctp-text placeholder-ctp-subtext1/50 focus:border-ctp-blue/60 focus:outline-none focus:ring-2 focus:ring-ctp-blue/20"
							autoFocus
						/>
						<div className="flex gap-3">
							<button
								type="button"
								onClick={handleSavePreset}
								className="flex-1 rounded-lg border border-ctp-overlay1/40 bg-ctp-green/40 px-4 py-2 font-medium text-ctp-green shadow-[0px_6px_12px_rgba(0,0,0,0.18)] transition duration-150 hover:-translate-y-px hover:bg-ctp-green/60 hover:shadow-[0px_10px_18px_rgba(0,0,0,0.22)]"
							>
								Save
							</button>
							<button
								type="button"
								onClick={() => {
									setShowPresetModal(false);
									setPresetName("");
								}}
								className="flex-1 rounded-lg border border-ctp-overlay1/40 bg-ctp-surface1/60 px-4 py-2 font-medium text-ctp-text shadow-[0px_6px_12px_rgba(0,0,0,0.18)] transition duration-150 hover:-translate-y-px hover:shadow-[0px_10px_18px_rgba(0,0,0,0.22)]"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</main>
	);
}
