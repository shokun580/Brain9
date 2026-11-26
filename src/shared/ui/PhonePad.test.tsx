import { describe, expect, it } from "vitest";
import { html } from "../../../test/render";
import { PhonePad, type PhonePadProps } from "./PhonePad";

const pad = (props: Partial<PhonePadProps> = {}) =>
  html(<PhonePad label="เบอร์โทรศัพท์" value="" onChange={() => {}} {...props} />);

describe("PhonePad", () => {
  it("has no visible text field, textarea or contenteditable", () => {
    for (const markup of [pad(), pad({ value: "0800000000", error: "กรุณาลองอีกครั้ง" })]) {
      expect(markup).not.toContain("<input");
      expect(markup).not.toContain("<textarea");
      expect(markup.toLowerCase()).not.toContain("contenteditable");
      expect(markup.toLowerCase()).not.toContain("inputmode");
      expect(markup).not.toContain("tabindex");
    }
  });

  it("allows only a hidden input, and only with a name", () => {
    const inputs = pad({ name: "phone", value: "0800000000" }).match(/<input[^>]*>/g) ?? [];
    expect(inputs).toHaveLength(1);
    expect(inputs[0]).toContain('type="hidden"');
    expect(inputs[0]).toContain('name="phone"');
    expect(inputs[0]).toContain('value="0800000000"');
  });

  it("shows the label and the formatted digits", () => {
    const markup = pad({ value: "0800000000" });
    expect(markup).toContain("เบอร์โทรศัพท์");
    expect(markup).toContain("080-000-0000");
    expect(markup).not.toContain("0xx-xxx-xxxx");
  });

  it("shows the pattern in the muted colour when empty", () => {
    const markup = pad();
    expect(markup).toContain("0xx-xxx-xxxx");
    expect(markup).toContain('aria-label="เบอร์โทรศัพท์ ยังไม่ได้ใส่"');
  });

  it("shows a partial number as typed", () => {
    expect(pad({ value: "0800" })).toContain("080-0");
  });

  it("announces progress politely and names the display with label and digits", () => {
    const markup = pad({ value: "080" });
    const live = markup.match(/<[^>]*aria-live="polite"[^>]*>[^<]*<\/[a-z]+>/)?.[0] ?? "";
    expect(live).toContain("sr-only");
    expect(live).toContain("ใส่แล้ว 3 จาก 10 หลัก");
    expect(markup).toContain('aria-label="เบอร์โทรศัพท์ 0 8 0"');
  });

  it("shows the hint, and the error with a cross instead of the hint", () => {
    expect(pad({ hint: "เบอร์ 10 หลัก" })).toContain("เบอร์ 10 หลัก");
    const withError = pad({ hint: "เบอร์ 10 หลัก", error: "เบอร์ยังไม่ครบ กรุณาใส่ให้ครบ" });
    expect(withError).toContain("✕ เบอร์ยังไม่ครบ กรุณาใส่ให้ครบ");
    expect(withError).toContain('role="alert"');
    expect(withError).not.toContain("เบอร์ 10 หลัก");
    expect(withError).toContain("border-danger");
  });

  it("has eleven buttons and locks them all when disabled", () => {
    const enabled = pad();
    expect((enabled.match(/<button/g) ?? []).length).toBe(11);
    expect(enabled).toContain("ลบ");
    expect((enabled.match(/<button[^>]* disabled=""/g) ?? []).length).toBe(0);
    const locked = pad({ disabled: true }).match(/<button[^>]*>/g) ?? [];
    expect(locked.length).toBe(11);
    for (const b of locked) expect(b).toMatch(/ disabled=""/);
  });

  it("uses the border-width token so it thickens in high contrast", () => {
    expect(pad()).toContain("border-[length:var(--b9-border)]");
  });
});
