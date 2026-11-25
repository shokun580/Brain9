import { describe, expect, it } from "vitest";
import { html } from "../../../test/render";
import { TextField } from "./TextField";

describe("TextField", () => {
  it("shows the error state and hides the hint", () => {
    const out = html(<TextField label="ชื่อคอร์ส" name="title" errors={["กรุณากรอก"]} hint="h" />);
    expect(out).toContain('for="field-title"');
    expect(out).toContain('aria-invalid="true"');
    expect(out).toContain('aria-describedby="field-title-error"');
    expect(out).toContain("border-danger");
    expect(out).toContain('role="alert"');
    expect(out).toContain("✕ กรุณากรอก");
    expect(out).not.toContain(">h<");
  });
  it("shows the hint when valid", () => {
    const out = html(<TextField label="a" name="a" hint="คำแนะนำ" />);
    expect(out).toContain(">คำแนะนำ<");
    expect(out).not.toContain('role="alert"');
  });
  it("honours a custom id", () => {
    expect(html(<TextField label="a" name="a" id="x" />)).toContain('for="x"');
  });
});
