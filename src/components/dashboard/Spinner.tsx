import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

/**
Small spinner for busy buttons. Stands still under reduced motion.
*/
export function Spinner({ className }: { readonly className?: string }) {
	return (
		<Loader2
			aria-hidden
			className={cn(
				"size-4 animate-spin motion-reduce:animate-none",
				className
			)}
		/>
	);
}
