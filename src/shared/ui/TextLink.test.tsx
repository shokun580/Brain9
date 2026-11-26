import { describe, expect, it } from "vitest";
import { html } from "../../../test/render";
import { TextLink } from "./TextLink";

describe("TextLink", () => {
  it("is a link to another screen, shown as underlined words", () => {
    const out = html(<TextLink href="/login/forgot">ลืมรหัส</TextLink>);
    expect(out).toMatch(/^<a [^>]*href="\/login\/forgot"/);
    expect(out).toContain(">ลืมรหัส</a>");
    expect(out).toContain("underline");
  });

  it("keeps a target as tall as a small control and never drops below the small text size", () => {
    const out = html(<TextLink href="/x">ก</TextLink>);
    expect(out).toContain("min-h-control-sm");
    expect(out).toContain("text-small");
  });

  it("is a button when it has no href", () => {
    const out = html(<TextLink onClick={() => {}}>อ่านฉบับเต็ม</TextLink>);
    expect(out).toMatch(/^<button [^>]*type="button"/);
    expect(out).not.toContain("href");
  });

  it("takes a layout class without losing its own look", () => {
    const out = html(
      <TextLink href="/x" className="mt-3">
        ก
      </TextLink>,
    );
    expect(out).toContain("mt-3");
    expect(out).toContain("text-primary-press");
  });
});
