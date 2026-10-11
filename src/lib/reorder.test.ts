import { describe, expect, it } from "vitest";
import { moveId, shuffleIds } from "./reorder.ts";

describe("moveId", () => {
	const ids = ["a", "b", "c"];

	it("moves one place", () => {
		expect(moveId(ids, "b", "up")).toEqual(["b", "a", "c"]);
		expect(moveId(ids, "b", "down")).toEqual(["a", "c", "b"]);
	});

	it("stays put at either end", () => {
		expect(moveId(ids, "a", "up")).toEqual(ids);
		expect(moveId(ids, "c", "down")).toEqual(ids);
	});

	it("doesn't change the original list, and reports an unknown id", () => {
		moveId(ids, "b", "up");
		expect(ids).toEqual(["a", "b", "c"]);
		expect(moveId(ids, "z", "up")).toBeUndefined();
	});
});

describe("shuffleIds", () => {
	const ids = ["a", "b", "c", "d", "e"];

	it("keeps every id exactly once", () => {
		expect(shuffleIds(ids).toSorted()).toEqual(ids);
	});

	it("doesn't change the list it is given", () => {
		const copy = [...ids];
		shuffleIds(copy);
		expect(copy).toEqual(ids);
	});

	it("is driven by the random source", () => {
		expect(shuffleIds(ids, () => 0)).toEqual(["b", "c", "d", "e", "a"]);
	});

	it("never hands back the original order when there is more than one", () => {
		// A random source that leaves everything in place would keep the order;
		// the result is rotated by one instead.
		expect(shuffleIds(ids, () => 0.999)).toEqual(["b", "c", "d", "e", "a"]);
		expect(shuffleIds(["only"])).toEqual(["only"]);
		expect(shuffleIds([])).toEqual([]);
	});
});
