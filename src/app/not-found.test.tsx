import { describe, expect, it } from "vitest";
import { html } from "../../test/render";
import NotFound, { metadata } from "./not-found";

describe("not-found screen", () => {
  const out = html(<NotFound />);

  it("has the Thai copy and a primary link to the home page", () => {
    expect(out).toContain("ยังหาหน้านี้ไม่เจอ");
    expect(out).toContain("ไม่เป็นไรนะ กลับไปหน้าหลักแล้วเริ่มใหม่ได้เลย");
    expect(out).toMatch(/<a[^>]*href="\/"[^>]*>กลับหน้าหลัก<\/a>/);
    expect(metadata.title).toBe("ไม่พบหน้านี้");
  });

  it("never says whether an address exists for someone else", () => {
    for (const word of ["404", "สิทธิ์", "admin"]) {
      expect(out.toLowerCase()).not.toContain(word);
    }
  });
});
