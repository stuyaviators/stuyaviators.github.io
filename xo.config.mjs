// Ported from the recode branch's xo.config.mjs (webcubed), converted to
// XO 5's array format (global ignores must be their own item).
/**
@type {import("xo").FlatXoConfig}
*/
const xoConfig = [
	{
		ignores: [
			"next-env.d.ts",
			".next/**",
			"**/next-env.d.ts",
			"eslint.config.mjs",
			"legacy/**",
			"drizzle/**",
			"public/**",
			// Tailwind v4 CSS syntax (@theme, @custom-variant) isn't standard CSS.
			"**/*.css",
		],
	},
	{
		// "compat": XO skips formatting rules and Prettier (prettier.config.mjs,
		// ported from recode) formats the code via `pnpm format`.
		prettier: "compat",
		semicolon: true,
		rules: {
			"import-x/order": "off",
			"import-x/newline-after-import": "off",
			"import-x/no-duplicates": "off",
			"new-cap": "off",
			"@typescript-eslint/triple-slash-reference": "off",
			"@typescript-eslint/naming-convention": [
				"error",
				{
					selector: "variable",
					format: ["camelCase", "PascalCase"],
				},
			],
			"unicorn/filename-case": "off",
			"import-x/extensions": "off",
			"unicorn/prefer-node-protocol": "off",
			"n/prefer-global/process": "off",
			// Project choices for idiomatic React/Next code:
			// - `cond ? <A /> : null` and `if (value)` on optional strings/objects.
			"@typescript-eslint/strict-boolean-expressions": [
				"error",
				{
					allowString: true,
					allowNumber: false,
					allowNullableObject: true,
					allowNullableBoolean: true,
					allowNullableString: true,
				},
			],
			// - Node's Buffer global is fine in server code and build scripts.
			"n/prefer-global/buffer": "off",
			// Next's SWC compiler drops "unnecessary" escapes such as `\-` inside
			// character classes, which is invalid under the `v` flag. Require `u`.
			"require-unicode-regexp": ["error", { requireFlag: "u" }],
			// Prettier removes "redundant" parentheses, so this rule fights it.
			"@stylistic/no-mixed-operators": "off",
		},
	},
];

export default xoConfig;
