import { describe, expect, it } from "vitest";
import { createCourseSchema, derivePatternStats, patternStepsSchema } from "./contracts";

describe("patternStepsSchema", () => {
  it("accepts a sequence with a two-finger step", () => {
    const result = patternStepsSchema.safeParse({
      v: 1,
      steps: [{ cells: [4] }, { cells: [0, 8], showMs: 1000 }, { cells: [2] }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a pattern with fewer than two steps", () => {
    const result = patternStepsSchema.safeParse({ v: 1, steps: [{ cells: [4] }] });
    expect(result.success).toBe(false);
  });

  it("rejects cells outside the 3x3 grid", () => {
    const result = patternStepsSchema.safeParse({ v: 1, steps: [{ cells: [9] }, { cells: [0] }] });
    expect(result.success).toBe(false);
  });

  it("rejects pressing the same cell twice in one step", () => {
    const result = patternStepsSchema.safeParse({
      v: 1,
      steps: [{ cells: [3, 3] }, { cells: [0] }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects more than two simultaneous cells", () => {
    const result = patternStepsSchema.safeParse({
      v: 1,
      steps: [{ cells: [0, 1, 2] }, { cells: [4] }],
    });
    expect(result.success).toBe(false);
  });
});

describe("derivePatternStats", () => {
  it("counts steps and detects simultaneous presses", () => {
    expect(
      derivePatternStats({ v: 1, steps: [{ cells: [1] }, { cells: [3, 5] }, { cells: [7] }] }),
    ).toEqual({ sequenceLength: 3, hasSimultaneous: true });
  });

  it("reports no simultaneous press for single-finger patterns", () => {
    expect(derivePatternStats({ v: 1, steps: [{ cells: [1] }, { cells: [2] }] })).toEqual({
      sequenceLength: 2,
      hasSimultaneous: false,
    });
  });
});

describe("createCourseSchema", () => {
  it("trims the title and coerces the difficulty from a form string", () => {
    const result = createCourseSchema.safeParse({
      title: "  คอร์สเริ่มต้น  ",
      description: "",
      difficultyLevel: "2",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        title: "คอร์สเริ่มต้น",
        description: undefined,
        difficultyLevel: 2,
      });
    }
  });

  it("rejects an empty title and an out-of-range difficulty", () => {
    const result = createCourseSchema.safeParse({ title: "   ", difficultyLevel: "9" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((issue) => issue.path.join("."));
      expect(fields).toContain("title");
      expect(fields).toContain("difficultyLevel");
    }
  });
});
