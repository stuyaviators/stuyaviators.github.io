/**
Moves `id` one place up or down in `ids`. Returns the new order, or undefined
when `id` isn't in the list. At either end the order is returned unchanged.
*/
export function moveId(
	ids: readonly string[],
	id: string,
	direction: "up" | "down"
): string[] | undefined {
	const index = ids.indexOf(id);
	if (index === -1) {
		return undefined;
	}

	const target = direction === "up" ? index - 1 : index + 1;
	const next = [...ids];
	if (target >= 0 && target < next.length) {
		next.splice(target, 0, ...next.splice(index, 1));
	}

	return next;
}

/**
The same ids in a random order (Fisher-Yates). With more than one id the order
always changes, so pressing "shuffle" never looks like nothing happened.
*/
export function shuffleIds(
	ids: readonly string[],
	random: () => number = Math.random
): string[] {
	const next = [...ids];
	for (let index = next.length - 1; index > 0; index--) {
		const other = Math.floor(random() * (index + 1));
		const held = next[index];
		next[index] = next[other] ?? "";
		next[other] = held ?? "";
	}

	// A shuffle can land on the original order: rotate by one to avoid that.
	if (next.length > 1 && next.every((id, position) => id === ids[position])) {
		next.push(next.shift()!);
	}

	return next;
}
