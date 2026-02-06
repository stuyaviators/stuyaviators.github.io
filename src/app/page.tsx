import { Stagger } from "@/components/TransitionProvider";

export default function Home() {
	return (
		<main className="flex min-h-screen w-full flex-col items-center justify-between py-8 px-6 sm:py-32 sm:px-16 sm:items-start">
			<div className="text-center mx-auto">
				<Stagger>
					<h1>StuyAviators</h1>
				</Stagger>
				<Stagger>
					<p className="mt-3 sm:mt-4">Stuyvesant High School's Aviation Club</p>
				</Stagger>
			</div>
		</main>
	);
}
