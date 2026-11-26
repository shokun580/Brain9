import { describe, expect, it } from "vitest";
import { html } from "../../../../test/render";
import { courseColumns } from "./course-columns";
import { CourseListSkeleton } from "./CourseListSkeleton";

describe("CourseListSkeleton", () => {
  it("shows every column label of the real list", () => {
    const out = html(<CourseListSkeleton />);
    for (const column of courseColumns) expect(out).toContain(column.label);
  });

  it("is one status region with its own label, inside the table card", () => {
    const out = html(<CourseListSkeleton />);
    expect(out.split('role="status"').length - 1).toBe(1);
    expect(out).toContain("กำลังโหลดรายการคอร์ส");
    expect(out).toContain("rounded-panel");
  });
});
