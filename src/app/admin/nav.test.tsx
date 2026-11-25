import { describe, expect, it } from "vitest";
import { adminNav } from "./nav";

const hrefsOf = (id: string) =>
  (adminNav.find((s) => s.id === id)?.groups ?? []).flatMap((g) => g.items.map((i) => i.href));

describe("adminNav", () => {
  it("has the agreed sections in order", () => {
    expect(adminNav.map((s) => s.id)).toEqual(["overview", "people", "booking", "content"]);
    expect(adminNav.map((s) => s.label)).toEqual(["ภาพรวม", "ผู้ใช้และศูนย์", "การจอง", "เนื้อหาและผล"]);
  });

  it("lists the agreed routes of each section in order", () => {
    expect(hrefsOf("overview")).toEqual(["/admin"]);
    expect(hrefsOf("people")).toEqual(["/admin/users", "/admin/privacy", "/admin/centers"]);
    expect(hrefsOf("booking")).toEqual(["/admin/schedule", "/admin/bookings"]);
    expect(hrefsOf("content")).toEqual(["/admin/content/courses", "/admin/analytics"]);
  });

  it("keeps section ids and hrefs unique", () => {
    const ids = adminNav.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const hrefs = adminNav.flatMap((s) => s.groups.flatMap((g) => g.items.map((i) => i.href)));
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("keeps every rail label short enough to sit under an icon", () => {
    for (const section of adminNav) {
      expect(section.railLabel.length).toBeGreaterThan(0);
      expect(section.railLabel.length).toBeLessThanOrEqual(8);
    }
  });

  it("gives every section at least one page", () => {
    for (const section of adminNav) {
      expect(section.groups.flatMap((g) => g.items).length).toBeGreaterThan(0);
    }
  });
});
