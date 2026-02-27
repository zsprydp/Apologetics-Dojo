import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn (class name merge utility)", () => {
  it("merges simple classes", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("resolves Tailwind conflicts (last wins)", () => {
    const result = cn("px-4", "px-6");
    expect(result).toBe("px-6");
  });

  it("handles undefined and null values", () => {
    expect(cn("base", undefined, null, "extra")).toBe("base extra");
  });

  it("returns empty string for no arguments", () => {
    expect(cn()).toBe("");
  });
});
