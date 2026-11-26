import { describe, expect, it } from "vitest";
import { html } from "../../../test/render";
import { StaffAuthShell } from "./StaffAuthShell";

const shell = (extra: Partial<Parameters<typeof StaffAuthShell>[0]> = {}) =>
  html(
    <StaffAuthShell brand="Brain9" roleLabel="สำหรับผู้ดูแล" {...extra}>
      <h1>เข้าสู่ระบบ</h1>
    </StaffAuthShell>,
  );

describe("StaffAuthShell", () => {
  it("renders in the admin scope and fills the viewport", () => {
    const out = shell();
    expect(out).toMatch(/^<div data-ui="admin"/);
    expect(out).toContain("min-h-dvh");
  });

  it("shows the brand, who the door is for, and the page inside main", () => {
    const out = shell();
    expect(out).toContain(">Brain9<");
    expect(out).toContain(">สำหรับผู้ดูแล<");
    expect(out).toMatch(/<main[^>]*><h1>เข้าสู่ระบบ<\/h1><\/main>/);
  });

  it("never renders a heading of its own: the page owns the h1", () => {
    expect(shell().match(/<h1/g)).toHaveLength(1);
  });

  it("draws no card around the form", () => {
    const main = shell().match(/<main[^>]*>/)?.[0] ?? "";
    expect(main).not.toContain("rounded-");
    expect(main).not.toContain("shadow-");
    expect(main).not.toContain("bg-");
  });

  it("names a non-production deployment in the footer, and nothing in production", () => {
    expect(shell({ environmentLabel: "staging" })).toContain("Brain9 ระบบฝึกสมองผู้สูงอายุ · staging");
    expect(shell()).toMatch(/<footer[^>]*>Brain9 ระบบฝึกสมองผู้สูงอายุ<\/footer>/);
  });

  it("does not fill the viewport when embedded in the catalogue", () => {
    expect(shell({ embedded: true })).not.toContain("min-h-dvh");
  });
});
