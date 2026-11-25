import { describe, expect, it } from "vitest";
import { html } from "../../../test/render";
import { NumberField } from "./NumberField";

describe("NumberField", () => {
  it("renders the unit suffix", () => {
    expect(html(<NumberField label="เวลา" name="ms" unit="มิลลิวินาที" />)).toContain("มิลลิวินาที");
  });
  it("uses a decimal keypad", () => {
    expect(html(<NumberField label="เวลา" name="ms" />)).toContain('inputMode="decimal"');
  });
  it("draws the focus ring on the bordered box", () => {
    const out = html(<NumberField label="เวลา" name="ms" />);
    expect(out).toContain("has-[:focus-visible]:outline-3");
    expect(out).toContain("has-[:focus-visible]:outline-offset-2");
    expect(out).toContain("has-[:focus-visible]:outline-focus");
  });
  it("shows errors", () => {
    expect(html(<NumberField label="เวลา" name="ms" errors={["ผิด"]} />)).toContain("✕ ผิด");
  });
});
