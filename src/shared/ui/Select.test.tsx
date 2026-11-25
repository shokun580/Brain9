import { describe, expect, it } from "vitest";
import { html } from "../../../test/render";
import { Select } from "./Select";

const options = [{ value: "1", label: "ระดับ 1" }];

describe("Select", () => {
  it("renders native options", () => {
    const out = html(<Select label="ระดับ" name="lv" options={options} />);
    expect(out).toContain('<option value="1">ระดับ 1</option>');
    expect(out).toContain('for="field-lv"');
  });
  it("shows errors", () => {
    const out = html(<Select label="ระดับ" name="lv" options={options} errors={["เลือก"]} />);
    expect(out).toContain('aria-invalid="true"');
    expect(out).toContain("✕ เลือก");
  });
});

describe("Select aria-describedby", () => {
  it("merges a caller aria-describedby after its own error id", () => {
    const out = html(
      <Select
        label="a"
        name="n"
        errors={["ผิด"]}
        aria-describedby="x"
        options={[{ value: "a", label: "A" }]}
      />,
    );
    expect(out).toContain('aria-describedby="field-n-error x"');
  });
  it("keeps a caller aria-describedby when there is no hint or error", () => {
    const out = html(
      <Select label="a" name="n" aria-describedby="x" options={[{ value: "a", label: "A" }]} />,
    );
    expect(out).toContain('aria-describedby="x"');
  });
});
