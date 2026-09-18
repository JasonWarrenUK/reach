import { describe, expect, it } from "vitest";
import { parseHash } from "./hash-state";

describe("parseHash", () => {
	it("round-trips the current segment keys", () => {
		expect(parseHash("s=spring")?.segment).toBe("spring");
		expect(parseHash("s=autumn")?.segment).toBe("autumn");
		expect(parseHash("s=sailing")?.segment).toBe("sailing");
		expect(parseHash("s=winter")?.segment).toBe("winter");
	});

	it("reads the legacy s=shoulder as spring", () => {
		expect(parseHash("s=shoulder")?.segment).toBe("spring");
	});

	it("leaves segment undefined for an unknown s value", () => {
		expect(parseHash("s=summer")?.segment).toBeUndefined();
	});

	it("returns null for an empty hash", () => {
		expect(parseHash("")).toBeNull();
	});
});
