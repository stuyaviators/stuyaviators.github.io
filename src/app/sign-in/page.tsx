import type { Metadata } from "next";
import { signInWithGoogle, signOutAction } from "@/actions/auth";
import logo from "@/assets/brand/logo.png";
import { auth } from "@/auth";
import { Button } from "@/components/ui/Button";
import { safeCallback } from "@/lib/auth-redirect";
import { isGoogleConfigured } from "@/lib/dashboard-env";
import { currentUser } from "@/lib/session";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "Sign In",
	robots: { index: false, follow: false },
};

type Search = { error?: string; callbackUrl?: string; signedOut?: string };

/**
Sign-in for club officers. Google proves who you are; the allowlist decides
whether you get in.
*/
export default async function SignInPage({
	searchParams,
}: {
	readonly searchParams: Promise<Search>;
}) {
	const { error, callbackUrl, signedOut } = await searchParams;
	const callback = safeCallback(callbackUrl);

	const [user, session] = await Promise.all([currentUser(), auth()]);
	if (user && !error) {
		redirect(callback);
	}

	const email = session?.user?.email ?? undefined;
	const isDenied = error === "AccessDenied" || (Boolean(session) && !user);
	const isConfigured = isGoogleConfigured();

	return (
		<main className="flex min-h-dvh items-center justify-center px-4 py-12">
			<div className="dash-rise w-full max-w-md rounded-3xl border border-hairline bg-surface p-8 shadow-card">
				<Image
					src={logo}
					alt=""
					width={56}
					height={56}
					className="rounded-xl"
				/>
				<h1 className="mt-5 text-3xl">Officer sign-in</h1>
				<p className="mt-2 text-muted">
					The StuyAviators dashboard is for club officers. Sign in with the
					Google account an admin added.
				</p>

				{isDenied ? (
					<div
						role="alert"
						className="dash-pop mt-6 rounded-xl border border-danger/60 bg-danger/10 p-4"
					>
						<h2 className="text-lg">You’re not authorized</h2>
						<p className="mt-1 text-sm">
							{email ? (
								<>
									<strong>{email}</strong> isn’t on the officer list.{" "}
								</>
							) : (
								"That Google account isn’t on the officer list. "
							)}
							Ask an admin to add the email you want to sign in with, or try a
							different account. Personal Gmail accounts work too.
						</p>
					</div>
				) : null}

				{error && !isDenied ? (
					<div
						role="alert"
						className="dash-pop mt-6 rounded-xl border border-danger/60 bg-danger/10 p-4 text-sm"
					>
						Couldn’t sign you in. Try again; if it keeps happening, tell an
						admin.
					</div>
				) : null}

				{signedOut ? (
					<p role="status" className="mt-6 text-sm text-success">
						You’re signed out.
					</p>
				) : null}

				{isConfigured ? (
					<form action={signInWithGoogle} className="mt-6">
						<input type="hidden" name="callbackUrl" value={callback} />
						<Button type="submit" className="w-full">
							{isDenied
								? "Try a different Google account"
								: "Sign in with Google"}
						</Button>
					</form>
				) : (
					<div className="mt-6 rounded-xl border border-field bg-surface-2 p-4 text-sm">
						<p className="font-semibold">Sign-in isn’t set up yet</p>
						<p className="mt-1 text-muted">
							Google sign-in needs <code>AUTH_GOOGLE_ID</code>,{" "}
							<code>AUTH_GOOGLE_SECRET</code> and <code>AUTH_SECRET</code>. The
							steps are in <code>docs/google-oauth-setup.md</code>.
						</p>
					</div>
				)}

				{session ? (
					<form action={signOutAction} className="mt-3">
						<Button type="submit" variant="ghost" className="w-full">
							Sign out{email ? ` of ${email}` : ""}
						</Button>
					</form>
				) : null}

				<p className="mt-6 text-center text-sm">
					<Link
						href="/"
						className="text-brand underline-offset-4 hover:underline"
					>
						Back to stuyaviators site
					</Link>
				</p>
			</div>
		</main>
	);
}
