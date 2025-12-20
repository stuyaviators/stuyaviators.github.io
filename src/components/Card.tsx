import React from "react";

import "@/styles/globals.css";

interface CardProps {
	children: React.ReactNode;
	className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
	return (
		<div className="group relative w-fit">
			{/* Fake bottom right card thingy to give it stacked effect */}
			<div className="absolute inset-0 rounded-lg border border-ctp-overlay1/30 bg-linear-to-br from-ctp-surface0/40 via-ctp-base/30 to-ctp-surface0/20 backdrop-blur-md translate-x-3 translate-y-3 transition-transform duration-300 group-hover:translate-x-4 group-hover:translate-y-4" />

			{/* Main card */}
			<div
				className={`relative rounded-lg border border-ctp-overlay1/50 bg-linear-to-br from-ctp-surface0/60 via-ctp-base/50 to-ctp-surface0/40 backdrop-blur-lg p-6 shadow-[0px_8px_16px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0px_12px_28px_rgba(0,0,0,0.2)] hover:border-ctp-overlay1/70 ${className}`}
			>
				{ /* Overlays n fx*/}
				<div className="absolute -bottom-3 -right-3 w-40 h-40 rounded-lg bg-linear-to-tl from-ctp-crust/80 via-ctp-crust/40 to-transparent blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

				<div className="absolute inset-0 rounded-lg bg-linear-to-br from-transparent via-transparent to-ctp-crust/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

				<div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-lg bg-linear-to-tl from-ctp-lavender/20 to-transparent blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-80 pointer-events-none" />

				{/* Content */}
				<div className="relative z-10">{children}</div>
			</div>
		</div>
	);
};
