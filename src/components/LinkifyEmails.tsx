import { Fragment } from "react";

const emailToken = /^[\w+\-.]+@[\w-]+(?:\.[\w-]+)+$/u;
const trailingPunctuation = new Set([".", ",", ";", ":", "!", "?", ")"]);

function splitTrailing(token: string) {
	let end = token.length;
	while (end > 0 && trailingPunctuation.has(token[end - 1] ?? "")) {
		end--;
	}

	return { word: token.slice(0, end), trailing: token.slice(end) };
}

/**
Renders text with every email address turned into a mailto: link.
*/
export default function LinkifyEmails({ text }: { readonly text: string }) {
	// Split on whitespace (keeping it) and check each word on its own.
	const tokens = text.split(/(?<space>\s+)/u);
	return (
		<>
			{tokens.map((token, index) => {
				const { word, trailing } = splitTrailing(token);
				if (!emailToken.test(word)) {
					return <Fragment key={index}>{token}</Fragment>;
				}

				return (
					<Fragment key={index}>
						<a
							href={`mailto:${word}`}
							className="text-link"
						>
							{word}
						</a>
						{trailing}
					</Fragment>
				);
			})}
		</>
	);
}
