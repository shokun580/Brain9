import { describe, expect, it } from "vitest";
import { findActiveNav, sectionHref, type AdminNavSection } from "./admin-nav";

const item = (href: string) => ({ href, label: href, icon: null });

const overview: AdminNavSection = {
  id: "overview",
  label: "ภาพรวม",
  railLabel: "ภาพรวม",
  icon: null,
  groups: [{ items: [item("/admin")] }],
};

const content: AdminNavSection = {
  id: "content",
  label: "เนื้อหาและผล",
  railLabel: "เนื้อหา",
  icon: null,
  groups: [
    { label: "ว่าง", items: [] },
    { items: [item("/admin/content"), item("/admin/content/courses"), item("/admin/analytics")] },
  ],
};

const sections = [overview, content];

describe("findActiveNav", () => {
  it("finds the page and its section for a child path", () => {
    expect(findActiveNav(sections, "/admin/content/courses/abc")).toEqual({
      sectionId: "content",
      href: "/admin/content/courses",
    });
  });

  it("matches /admin exactly only", () => {
    expect(findActiveNav(sections, "/admin")).toEqual({ sectionId: "overview", href: "/admin" });
    expect(findActiveNav(sections, "/admin/unknown")).toBeNull();
  });

  it("ignores a trailing slash", () => {
    expect(findActiveNav(sections, "/admin/analytics/")?.href).toBe("/admin/analytics");
  });

  it("returns null for null, empty and unknown paths", () => {
    expect(findActiveNav(sections, null)).toBeNull();
    expect(findActiveNav(sections, "")).toBeNull();
    expect(findActiveNav(sections, "/somewhere")).toBeNull();
  });

  it("prefers the longer match", () => {
    expect(findActiveNav(sections, "/admin/content/courses")?.href).toBe("/admin/content/courses");
    expect(findActiveNav(sections, "/admin/content")?.href).toBe("/admin/content");
  });
});

describe("sectionHref", () => {
  it("skips an empty first group", () => {
    expect(sectionHref(content)).toBe("/admin/content");
  });

  it("falls back to /admin for a section without pages", () => {
    expect(sectionHref({ id: "x", label: "x", railLabel: "x", icon: null, groups: [] })).toBe(
      "/admin",
    );
  });
});
