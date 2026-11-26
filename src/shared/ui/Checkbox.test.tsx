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

describe("Checkbox look", () => {
  const box = (markup: string) => markup.match(/<span aria-hidden="true"[^>]*>/)?.[0] ?? "";

  it("keeps the real input in the page, hidden from sight only", () => {
    const out = html(<Checkbox label="ยอมรับ" name="ok" />);
    const input = out.match(/<input[^>]*>/)?.[0] ?? "";
    expect(input).toContain("sr-only");
    expect(input).not.toContain("hidden");
    expect(input).not.toContain("display");
  });

  it("draws its own box, which fills with the primary colour and shows a tick when checked", () => {
    const out = html(<Checkbox label="ยอมรับ" name="ok" />);
    expect(box(out)).toContain("group-has-[:checked]:bg-primary");
    expect(box(out)).toContain("border-line-strong");
    expect(out).toMatch(/<svg[^>]*group-has-\[:checked\]:opacity-100/);
  });

  it("sizes the box from the text, so it grows with the text-size setting", () => {
    expect(box(html(<Checkbox label="ยอมรับ" name="ok" />))).toContain("size-[1.5em]");
  });

  it("marks an error on the box as well as in words", () => {
    const out = html(<Checkbox label="ยอมรับ" name="ok" errors={["ต้องเลือก"]} />);
    expect(box(out)).toContain("border-danger");
    expect(box(out)).not.toContain("border-line-strong");
  });

  it("shows the focus ring on the whole row and dims a disabled one", () => {
    const label = html(<Checkbox label="ยอมรับ" name="ok" />).match(/<label[^>]*>/)?.[0] ?? "";
    expect(label).toContain("has-[:focus-visible]:outline-focus");
    expect(label).toContain("has-[:disabled]:opacity-60");
    expect(label).toContain("min-h-control");
  });

  it("puts a layout class on the wrapper, not on the hidden input", () => {
    const out = html(<Checkbox label="ยอมรับ" name="ok" className="mt-4" />);
    expect(out).toMatch(/^<div class="[^"]*mt-4/);
    expect(out.match(/<input[^>]*>/)?.[0]).not.toContain("mt-4");
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
