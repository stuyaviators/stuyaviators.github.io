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
