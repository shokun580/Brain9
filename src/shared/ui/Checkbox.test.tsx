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
