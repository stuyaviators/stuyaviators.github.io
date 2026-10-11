"use server";

import { signIn, signOut } from "@/auth";
import { safeCallback } from "@/lib/auth-redirect";

export async function signInWithGoogle(formData: FormData) {
	// Always offer the account chooser, so officers with several Google
	// accounts don't get signed in with the wrong one.
	await signIn(
		"google",
		{ redirectTo: safeCallback(formData.get("callbackUrl")) },
		{ prompt: "select_account" }
	);
}

export async function signOutAction() {
	await signOut({ redirectTo: "/sign-in?signedOut=1" });
}
