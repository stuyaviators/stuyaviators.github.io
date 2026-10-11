import { describe, expect, it } from "vitest";
import { defaultNewsletter } from "./defaults.ts";
import { renderNewsletter } from "./render.tsx";
import { newsletterSchema } from "./types.ts";

function data(overrides: Record<string, unknown> = {}) {
	return newsletterSchema.parse({ ...defaultNewsletter(), ...overrides });
}

describe("renderNewsletter", () => {
	it("always includes the unsubscribe link, even with no footer links", async () => {
		const { html, text } = await renderNewsletter(
			data({ footerLinks: [], footerText: "" })
		);
		expect(html).toContain("mailto:stuyaviators@gmail.com?subject=Unsubscribe");
		expect(html).toContain("Unsubscribe");
		expect(text).toContain("Unsubscribe");
	});

	it("shows “View in browser” only for a published web version", async () => {
		expect((await renderNewsletter(data())).html).not.toContain(
			"View in browser"
		);
		const published = await renderNewsletter(data(), "october-update");
		expect(published.html).toContain("View in browser");
		expect(published.html).toContain("/newsletter/october-update");
	});

	it("escapes text instead of injecting markup", async () => {
		const { html } = await renderNewsletter(
			data({
				headerTitle: '<script>alert("title")</script>',
				introHeading: "<img src=x onerror=alert(1)>",
				blocks: [
					{
						id: "a",
						type: "separator",
						title: "<b onmouseover=alert(1)>Heading</b>",
					},
					{
						id: "b",
						type: "subheading",
						title: "</div><script>alert(2)</script>",
					},
				],
			})
		);
		expect(html).not.toContain("<script>alert");
		expect(html).not.toContain("<img src=x");
		expect(html).not.toContain("<b onmouseover");
		expect(html).toContain("&lt;script&gt;");
	});

	it("doesn't let markdown smuggle in raw HTML, but keeps real formatting", async () => {
		const { html } = await renderNewsletter(
			data({
				introText:
					"**Welcome** <script>alert(1)</script> <img src=x onerror=alert(2)> [site](https://stuyaviators.vercel.app)",
			})
		);
		expect(html).not.toContain("<script>alert(1)");
		expect(html).not.toContain("<img src=x");
		expect(html).toContain("<strong");
		expect(html).toContain('href="https://stuyaviators.vercel.app"');
	});

	it("neutralizes javascript: links in markdown", async () => {
		const { html } = await renderNewsletter(
			data({ introText: "[click](javascript:alert(1))" })
		);
		expect(html).not.toContain('href="javascript:');
	});

	it("uses inline styles and absolute image URLs (what Gmail needs)", async () => {
		const { html } = await renderNewsletter(
			data({
				blocks: [
					{
						id: "a",
						type: "article",
						title: "Hi",
						body: "Body",
						imageUrl: "https://abc.public.blob.vercel-storage.com/x.jpg",
						buttonText: "Read",
						buttonUrl: "https://example.org",
					},
				],
			})
		);
		expect(html).toContain(
			'src="https://abc.public.blob.vercel-storage.com/x.jpg"'
		);
		expect(html).toContain('href="https://example.org"');
		expect(html).toMatch(/style="[^"]*font-family/u);
		expect(html).not.toContain("backdrop-filter");
	});
});

describe("newsletterSchema", () => {
	it("refuses non-http links everywhere", () => {
		for (const url of ["javascript:alert(1)", "data:text/html,x", "ftp://x"]) {
			expect(
				newsletterSchema.safeParse({
					...defaultNewsletter(),
					headerLogoUrl: url,
				}).success
			).toBe(false);
			expect(
				newsletterSchema.safeParse({
					...defaultNewsletter(),
					blocks: [
						{
							id: "a",
							type: "article",
							title: "",
							body: "",
							imageUrl: "",
							buttonText: "x",
							buttonUrl: url,
						},
					],
				}).success
			).toBe(false);
			expect(
				newsletterSchema.safeParse({
					...defaultNewsletter(),
					footerLinks: [{ label: "x", url }],
				}).success
			).toBe(false);
		}
	});
});
