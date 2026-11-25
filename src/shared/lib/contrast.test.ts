import { expect, it } from "vitest";
import { contrastRatio } from "./contrast";

it("computes WCAG contrast ratios", () => {
  expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
  expect(contrastRatio("#FFFFFF", "#FFFFFF")).toBeCloseTo(1, 5);
  expect(contrastRatio("#0B7A75", "#FFFFFF")).toBeGreaterThan(4.5);
  expect(contrastRatio("#fff", "#000")).toBeCloseTo(21, 1); // 3-digit and lower case
});
