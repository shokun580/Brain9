import { describe, expect, it } from "vitest";
import { notDeleted, softDelete } from "./soft-delete";

describe("soft-delete helpers", () => {
  it("filters to rows that are not soft-deleted", () => {
    expect(notDeleted).toEqual({ deletedAt: null });
  });

  it("can be spread into a larger where clause without losing the filter", () => {
    expect({ ...notDeleted, status: "PUBLISHED" }).toEqual({
      deletedAt: null,
      status: "PUBLISHED",
    });
  });

  it("marks a row as deleted at the given time", () => {
    const now = new Date("2026-11-26T03:00:00.000Z");
    expect(softDelete(now)).toEqual({ deletedAt: now });
  });

  it("defaults to the current time", () => {
    const before = Date.now();
    const { deletedAt } = softDelete();
    expect(deletedAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(deletedAt.getTime()).toBeLessThanOrEqual(Date.now());
  });
});
