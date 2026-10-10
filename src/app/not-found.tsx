import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";

export default function NotFound() {
	return (
		<Container className="py-20 sm:py-28">
			<p className="label text-accent-text">Error 404 · Off course</p>
			<h1 className="mt-3 text-4xl sm:text-5xl">We can’t find that page</h1>
			<p className="mt-4 max-w-xl text-lg text-muted">
				The page may have moved when we rebuilt the site. Try one of these instead.
			</p>
			<div className="mt-8 flex flex-wrap gap-3">
				<Link href="/" className={buttonClasses("accent")}>Back to home</Link>
				<Link href="/meetings" className={buttonClasses("secondary")}>Meetings</Link>
				<Link href="/connect" className={buttonClasses("ghost")}>Contact us</Link>
			</div>
		</Container>
	);
}
