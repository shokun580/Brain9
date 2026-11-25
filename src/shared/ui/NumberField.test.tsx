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
  it("shows errors", () => {
    expect(html(<NumberField label="เวลา" name="ms" errors={["ผิด"]} />)).toContain("✕ ผิด");
  });
});
