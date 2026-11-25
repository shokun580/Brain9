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

describe("NumberField aria-describedby", () => {
  it("merges a caller aria-describedby after its own error id", () => {
    const out = html(<NumberField label="a" name="n" errors={["ผิด"]} aria-describedby="x" />);
    expect(out).toContain('aria-describedby="field-n-error x"');
  });
  it("keeps a caller aria-describedby when there is no hint or error", () => {
    const out = html(<NumberField label="a" name="n" aria-describedby="x" />);
    expect(out).toContain('aria-describedby="x"');
  });
});

describe("NumberField unit", () => {
  it("describes the input with the unit id", () => {
    const out = html(<NumberField label="a" name="n" unit="มิลลิวินาที" />);
    expect(out).toContain('aria-describedby="field-n-unit"');
    expect(out).toMatch(/<span id="field-n-unit"[^>]*>มิลลิวินาที<\/span>/);
  });
  it("lists the hint, then the unit", () => {
    const out = html(<NumberField label="a" name="n" unit="วินาที" hint="ช่วย" />);
    expect(out).toContain('aria-describedby="field-n-hint field-n-unit"');
  });
  it("lists the error, then the unit", () => {
    const out = html(<NumberField label="a" name="n" unit="วินาที" errors={["ผิด"]} />);
    expect(out).toContain('aria-describedby="field-n-error field-n-unit"');
  });
  it("puts the caller's id last", () => {
    const out = html(
      <NumberField label="a" name="n" unit="วินาที" hint="ช่วย" aria-describedby="x" />,
    );
    expect(out).toContain('aria-describedby="field-n-hint field-n-unit x"');
  });
  it("adds no unit id without a unit", () => {
    const out = html(<NumberField label="a" name="n" hint="ช่วย" />);
    expect(out).not.toContain("-unit");
  });
  it("hides the unit from the label name but keeps it referenced by the input", () => {
    const out = html(<NumberField label="a" name="n" unit="วินาที" />);
    expect(out).toMatch(/<span id="field-n-unit"[^>]*aria-hidden="true"[^>]*>วินาที<\/span>/);
    expect(out).toContain('aria-describedby="field-n-unit"');
  });
  it("makes the whole box a label so a click anywhere focuses the input", () => {
    const out = html(<NumberField label="a" name="n" unit="วินาที" />);
    expect(out).toMatch(/<label for="field-n" class="[^"]*rounded-field[^"]*"/);
  });
});
