// Ported from the recode branch's xo.config.mjs (webcubed), converted to
// XO 5's array format (global ignores must be their own item).
/** @type {import("xo").FlatXoConfig} */
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
		},
	},
];

export default xoConfig;
