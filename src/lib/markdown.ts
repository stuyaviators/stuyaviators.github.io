import MarkdownIt from "markdown-it";

/*
 * Ported from recode's src/lib/markdown.ts (webcubed): raw HTML disabled, so
 * officer-entered text can't inject markup. markdown-it's validateLink already
 * blocks javascript:/vbscript:/file: URLs. Added: external links open in a new
 * tab with rel="noopener noreferrer", and images are not rendered.
 */
const md = new MarkdownIt({ html: false, linkify: true, breaks: true });
md.disable("image");

const defaultLinkOpen =
	md.renderer.rules.link_open ??
	((tokens, index, options, _env, self) =>
		self.renderToken(tokens, index, options));

md.renderer.rules.link_open = (tokens, index, options, env, self) => {
	const token = tokens[index]!;
	const href = String(token.attrGet("href") ?? "");
	if (/^https?:\/\//i.test(href)) {
		token.attrSet("target", "_blank");
		token.attrSet("rel", "noopener noreferrer");
	}

	return defaultLinkOpen(tokens, index, options, env, self);
};

export function renderMarkdown(source: string): string {
	return md.render(source ?? "");
}

/** Inline-only rendering for trusted static copy (links, emphasis). */
export function renderInline(source: string): string {
	return md.renderInline(source ?? "");
}

export type RenderMarkdown = typeof renderMarkdown;
