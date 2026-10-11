import { describe, expect, it } from "vitest";
import { moveId } from "./reorder.ts";

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
