type FormFieldProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	required?: boolean;
	type?: "text" | "url" | "textarea";
};

export const FormField: React.FC<FormFieldProps> = ({
	label,
	value,
	onChange,
	placeholder,
	required = false,
	type = "text",
}) => {
	const inputClasses =
		"w-full rounded-lg border border-ctp-overlay1/60 bg-ctp-surface0/60 px-3 py-2 text-sm text-ctp-text placeholder:text-ctp-subtext0/60 shadow-[0px_4px_10px_rgba(0,0,0,0.12)] transition duration-150 focus:border-ctp-blue/70 focus:shadow-[0px_6px_14px_rgba(0,0,0,0.18)] focus:outline-none focus:ring-2 focus:ring-ctp-blue/30";

	return (
		<div className="space-y-1.5">
			<label className="block text-sm font-medium text-ctp-subtext1">
				{label}
				{required && <span className="text-ctp-red ml-1">*</span>}
			</label>
			{type === "textarea" ? (
				<textarea
					value={value}
					onChange={(event) => {
						onChange(event.target.value);
					}}
					placeholder={placeholder}
					required={required}
					rows={4}
					className={inputClasses}
				/>
			) : (
				<input
					type={type}
					value={value}
					onChange={(event) => {
						onChange(event.target.value);
					}}
					placeholder={placeholder}
					required={required}
					className={inputClasses}
				/>
			)}
		</div>
	);
};
