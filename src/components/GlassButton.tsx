import type { ReactNode } from "react";

type GlassButtonProps = {
	onClick?: () => void;
	children?: ReactNode;
	variant?: "primary" | "secondary" | "danger";
	type?: "button" | "submit" | "reset";
	className?: string;
	title?: string;
	disabled?: boolean;
	icon?: ReactNode;
	iconPosition?: "left" | "right";
};

export const GlassButton: React.FC<GlassButtonProps> = ({
	onClick,
	children,
	variant = "primary",
	type = "button",
	className = "",
	title,
	disabled = false,
	icon,
	iconPosition = "left",
}) => {
	const variantClasses = {
		primary:
			"border-ctp-overlay1/60 bg-ctp-surface1/60 text-ctp-text hover:bg-ctp-surface1/90 hover:border-ctp-mauve/60",
		secondary:
			"border-ctp-overlay1/60 bg-ctp-surface0/60 text-ctp-subtext1 hover:bg-ctp-surface0/90 hover:border-ctp-blue/60",
		danger:
			"border-ctp-overlay1/60 bg-ctp-surface1/60 text-ctp-subtext1 hover:border-ctp-red/60 hover:bg-ctp-surface1/90 hover:text-ctp-red",
	};

	return (
		<button
			type={type}
			onClick={onClick}
			title={title}
			disabled={disabled}
			className={`inline-flex cursor-pointer items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium shadow-[0px_6px_12px_rgba(0,0,0,0.18)] transition duration-150 hover:-translate-y-px hover:shadow-[0px_10px_18px_rgba(0,0,0,0.22)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${variantClasses[variant]} ${className}`}
		>
			{icon && iconPosition === "left" && (
				<span className={children ? "mr-2" : ""}>{icon}</span>
			)}
			{children}
			{icon && iconPosition === "right" && (
				<span className={children ? "ml-2" : ""}>{icon}</span>
			)}
		</button>
	);
};
