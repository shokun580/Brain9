import { describe, expect, it } from "vitest";
import { adminNav } from "./nav";

describe("adminNav", () => {
  it("lists the agreed routes in order", () => {
    expect(adminNav.flatMap((g) => g.items).map((i) => i.href)).toEqual([
      "/admin",
      "/admin/users",
      "/admin/centers",
      "/admin/privacy",
      "/admin/schedule",
      "/admin/bookings",
      "/admin/content/courses",
      "/admin/analytics",
    ]);
  });

  it("groups the items under the agreed labels", () => {
    expect(adminNav.map((g) => g.label)).toEqual([undefined, "ผู้ใช้และศูนย์", "การจอง", "เนื้อหาและผล"]);
  });
});
