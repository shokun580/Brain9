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
