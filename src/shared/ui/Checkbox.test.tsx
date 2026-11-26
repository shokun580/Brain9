import { describe, expect, it } from "vitest";
import { html } from "../../../test/render";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("renders a labelled checkbox", () => {
    const out = html(<Checkbox label="ยอมรับ" name="ok" />);
    expect(out).toMatch(/<input[^>]*type="checkbox"/);
    expect(out).toContain("ยอมรับ");
    expect(out).toContain('for="field-ok"');
  });
});

describe("Checkbox hint and errors", () => {
  it("shows an error, hides the hint and wires aria", () => {
    const out = html(<Checkbox label="ยอมรับ" name="ok" hint="h" errors={["ต้องยอมรับ"]} />);
    expect(out).toContain('aria-invalid="true"');
    expect(out).toContain('aria-describedby="field-ok-error"');
    expect(out).toContain('role="alert"');
    expect(out).toContain("✕ ต้องยอมรับ");
    expect(out).not.toContain(">h<");
  });
  it("shows the hint when valid", () => {
    const out = html(<Checkbox label="ยอมรับ" name="ok" hint="คำแนะนำ" />);
    expect(out).toContain(">คำแนะนำ<");
    expect(out).toContain('aria-describedby="field-ok-hint"');
    expect(out).not.toContain('role="alert"');
  });
  it("merges a caller aria-describedby", () => {
    const out = html(<Checkbox label="a" name="ok" errors={["ผิด"]} aria-describedby="x" />);
    expect(out).toContain('aria-describedby="field-ok-error x"');
  });
});
