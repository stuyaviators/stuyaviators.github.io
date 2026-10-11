import { renderMarkdown } from "@/lib/markdown";

/*
 * Markdown for emails. Gmail ignores most <style> rules, so the tags
 * markdown-it produces (it runs with raw HTML disabled) get inline styles.
 */
const styles = new Map(
	Object.entries({
		p: "margin:0 0 14px;font-size:15px;line-height:1.6;color:#2b2b30;",
		a: "color:#0b64a9;text-decoration:underline;",
		ul: "margin:0 0 14px;padding-left:22px;font-size:15px;line-height:1.6;color:#2b2b30;",
		ol: "margin:0 0 14px;padding-left:22px;font-size:15px;line-height:1.6;color:#2b2b30;",
		li: "margin:0 0 4px;",
		strong: "font-weight:700;",
		em: "font-style:italic;",
		blockquote:
			"margin:0 0 14px;padding:4px 0 4px 14px;border-left:3px solid #d0d7e2;color:#4f4f56;",
		h1: "margin:0 0 10px;font-size:20px;line-height:1.3;color:#111113;",
		h2: "margin:0 0 10px;font-size:18px;line-height:1.3;color:#111113;",
		h3: "margin:0 0 10px;font-size:16px;line-height:1.3;color:#111113;",
		code: "font-family:Menlo,Consolas,monospace;font-size:13px;background:#f1f3f6;padding:1px 4px;border-radius:4px;",
		hr: "border:0;border-top:1px solid #e3e6ea;margin:18px 0;",
	})
);

export function emailMarkdown(source: string): string {
	return renderMarkdown(source).replaceAll(
		/<(?<tag>p|a|ul|ol|li|strong|em|blockquote|h[1-3]|code|hr)(?<rest>[\s/>])/gu,
		(match, tag: string, rest: string) =>
			styles.has(tag) ? `<${tag} style="${styles.get(tag)}"${rest}` : match
	);
}
