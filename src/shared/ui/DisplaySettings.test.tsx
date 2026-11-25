import { describe, expect, it } from "vitest";
import { html } from "../../../test/render";
import { DisplaySettings } from "./DisplaySettings";

describe("DisplaySettings", () => {
  const out = html(<DisplaySettings />);
  it("shows the default trigger label, or a custom one", () => {
    expect(out).toContain("ก ขนาดตัวอักษร");
    expect(html(<DisplaySettings triggerLabel="ตั้งค่าการแสดงผล" />)).toContain("ตั้งค่าการแสดงผล");
  });
  it("offers three sizes, a labelled contrast switch with its state in words, and a close button", () => {
    for (const text of ["ปกติ", "ใหญ่", "ใหญ่มาก", "สีตัดกันสูง", "ปิดอยู่", "เสร็จ"]) {
      expect(out).toContain(text);
    }
    expect(out).toContain('role="switch"');
    expect(out).toContain("<dialog");
    expect(out).toContain("<h2");
  });
});

describe("DisplaySettings dialog sizing", () => {
  it("caps the dialog to the viewport and scrolls inside", () => {
    const out = html(<DisplaySettings />);
    expect(out).toMatch(/<dialog[^>]*max-h-\[calc\(100dvh-2rem\)\]/);
    expect(out).toMatch(/<dialog[^>]*overflow-y-auto/);
    expect(out).toMatch(/<h2[^>]*text-heading/);
  });
});
