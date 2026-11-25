import { describe, expect, it } from "vitest";
import { isActivePath } from "./nav";

describe("isActivePath", () => {
  it("matches the exact path and child segments", () => {
    expect(isActivePath("/courses", "/courses")).toBe(true);
    expect(isActivePath("/courses/abc", "/courses")).toBe(true);
    expect(isActivePath("/courses/abc/play", "/courses")).toBe(true);
  });

  it("does not match a sibling that shares a prefix or another section", () => {
    expect(isActivePath("/coursesx", "/courses")).toBe(false);
    expect(isActivePath("/home", "/courses")).toBe(false);
  });

  it("matches `/` and `/admin` exactly only", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/home", "/")).toBe(false);
    expect(isActivePath("/admin", "/admin")).toBe(true);
    expect(isActivePath("/admin/users", "/admin")).toBe(false);
  });

  it("tolerates a trailing slash", () => {
    expect(isActivePath("/courses/", "/courses")).toBe(true);
    expect(isActivePath("/courses", "/courses/")).toBe(true);
    expect(isActivePath("/admin/", "/admin")).toBe(true);
  });

  it("is safe for an empty pathname or href", () => {
    expect(isActivePath("", "/courses")).toBe(false);
    expect(isActivePath("", "/")).toBe(false);
    expect(isActivePath("/courses", "")).toBe(false);
    expect(isActivePath("", "")).toBe(false);
  });
});
