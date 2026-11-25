import { describe, expect, it } from "vitest";
import { pageItems, pageRange } from "./pagination";

describe("pageRange", () => {
  it("computes the first, last and a clamped page", () => {
    expect(pageRange(1, 20, 128)).toEqual({ page: 1, from: 1, to: 20, pageCount: 7 });
    expect(pageRange(7, 20, 128)).toEqual({ page: 7, from: 121, to: 128, pageCount: 7 });
    expect(pageRange(99, 20, 128).page).toBe(7);
    expect(pageRange(0, 20, 128).page).toBe(1);
  });
  it("handles an empty and a short list", () => {
    expect(pageRange(1, 20, 0)).toEqual({ page: 1, from: 0, to: 0, pageCount: 0 });
    expect(pageRange(1, 20, 4)).toEqual({ page: 1, from: 1, to: 4, pageCount: 1 });
  });
  it("is total: bad numbers never throw or give NaN", () => {
    const first = { page: 1, from: 1, to: 20, pageCount: 7 };
    expect(pageRange(NaN, 20, 128)).toEqual(first);
    expect(pageRange(1.7, 20, 128)).toEqual(first);
    expect(pageRange(1, 20, -5)).toEqual({ page: 1, from: 0, to: 0, pageCount: 0 });
    expect(pageRange(2, 0, 10)).toEqual({ page: 2, from: 2, to: 2, pageCount: 10 });
    expect(pageRange(Infinity, 20, NaN)).toEqual({ page: 1, from: 0, to: 0, pageCount: 0 });
    expect(pageRange(1, NaN, 3)).toEqual({ page: 1, from: 1, to: 1, pageCount: 3 });
  });
});

describe("pageItems", () => {
  it("shows first, last, the current page and its neighbours", () => {
    expect(pageItems(1, 7)).toEqual([1, 2, "ellipsis", 7]);
    expect(pageItems(4, 7)).toEqual([1, "ellipsis", 3, 4, 5, "ellipsis", 7]);
    expect(pageItems(1, 2)).toEqual([1, 2]);
  });
  it("handles one page and none", () => {
    expect(pageItems(1, 1)).toEqual([1]);
    expect(pageItems(1, 0)).toEqual([]);
  });
  it("clamps the page to the last page", () => {
    expect(pageItems(99, 7)).toEqual([1, "ellipsis", 6, 7]);
  });
});
