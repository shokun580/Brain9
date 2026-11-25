import { describe, expect, it } from "vitest";
import { html } from "../../../test/render";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("renders a labelled textarea with errors", () => {
    const out = html(<Textarea label="คำอธิบาย" name="desc" errors={["สั้นไป"]} />);
    expect(out).toContain("<textarea");
    expect(out).toContain('for="field-desc"');
    expect(out).toContain('aria-invalid="true"');
    expect(out).toContain("✕ สั้นไป");
  });
});

describe("Textarea aria-describedby", () => {
  it("merges a caller aria-describedby after its own error id", () => {
    const out = html(<Textarea label="a" name="n" errors={["ผิด"]} aria-describedby="x" />);
    expect(out).toContain('aria-describedby="field-n-error x"');
  });
  it("keeps a caller aria-describedby when there is no hint or error", () => {
    const out = html(<Textarea label="a" name="n" aria-describedby="x" />);
    expect(out).toContain('aria-describedby="x"');
  });
});
