/*
 * Career finder: each answer adds points to career families (ids from
 * careers.ts). "Yes" counts double, "Sort of" counts once.
 */
export type QuizQuestion = {
	id: string;
	text: string;
	weights: Record<string, number>;
};

export const quizQuestions: QuizQuestion[] = [
	{
		id: "manage",
		text: "Do you like to manage things, like plans, people or budgets?",
		weights: { business: 2, operations: 2, airports: 2, safety: 1 },
	},
	{
		id: "air",
		text: "Do you want to spend your working day in the air?",
		weights: { flying: 3, cabin: 2, military: 1, space: 1 },
	},
	{
		id: "build",
		text: "Do you enjoy building, fixing or taking things apart?",
		weights: { maintenance: 3, engineering: 2, uncrewed: 1 },
	},
	{
		id: "math",
		text: "Do you like math and physics?",
		weights: { engineering: 3, space: 2, operations: 1, atc: 1 },
	},
	{
		id: "people",
		text: "Do you enjoy helping and working with people face to face?",
		weights: { cabin: 3, health: 2, airports: 1, media: 1 },
	},
	{
		id: "pressure",
		text: "Do you stay calm and make quick decisions under pressure?",
		weights: { atc: 3, flying: 2, military: 2, airports: 1 },
	},
	{
		id: "serve",
		text: "Are you interested in serving in the military or public service?",
		weights: { military: 3, airports: 1, safety: 1 },
	},
	{
		id: "space",
		text: "Does space exploration excite you more than airplanes?",
		weights: { space: 3, engineering: 1 },
	},
	{
		id: "tech",
		text: "Do you like computers, coding or gadgets?",
		weights: { uncrewed: 3, engineering: 2, maintenance: 1 },
	},
	{
		id: "investigate",
		text: "Do you like solving mysteries and figuring out why things went wrong?",
		weights: { safety: 3, engineering: 1, maintenance: 1 },
	},
	{
		id: "weather",
		text: "Do you find weather, maps and planning routes interesting?",
		weights: { operations: 3, atc: 2, flying: 1 },
	},
	{
		id: "communicate",
		text: "Do you like teaching, writing, photography or making videos?",
		weights: { media: 3, uncrewed: 1, business: 1 },
	},
	{
		id: "health",
		text: "Are you interested in medicine, or in how flying affects the human body and mind?",
		weights: { health: 3, safety: 1, engineering: 1 },
	},
];

export const quizAnswers = [
	{ value: 2, label: "Yes" },
	{ value: 1, label: "Sort of" },
	{ value: 0, label: "Not really" },
] as const;
