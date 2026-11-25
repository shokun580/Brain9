import { describe, expect, it } from "vitest";
import { html } from "../../../test/render";
import { Button } from "./Button";

describe("Button", () => {
  it("defaults to type=button", () => {
    expect(html(<Button>บันทึก</Button>)).toMatch(/<button[^>]*type="button"/);
  });
  it("keeps a given type", () => {
    expect(html(<Button type="submit">ส่ง</Button>)).toMatch(/<button[^>]*type="submit"/);
  });
  it("styles each variant through tokens", () => {
    expect(html(<Button>x</Button>)).toContain("bg-primary");
    expect(html(<Button>x</Button>)).toContain("text-on-primary");
    expect(html(<Button variant="secondary">x</Button>)).toContain("border-line-strong");
    expect(html(<Button variant="quiet">x</Button>)).toContain("text-fg-2");
    expect(html(<Button variant="danger">ลบ</Button>)).toContain("bg-danger");
  });
  it("keeps danger text readable in every scope", () => {
    const out = html(<Button variant="danger">x</Button>);
    expect(out).toContain("text-on-danger");
    expect(out).not.toContain("text-white");
  });
  it("uses control sizes and text sizes", () => {
    const def = html(<Button>x</Button>);
    expect(def).toContain("min-h-control");
    expect(def).toContain("text-lead");
    expect(def).toContain("rounded-control");
    expect(def).toContain("font-bold");
    const sm = html(<Button size="sm">x</Button>);
    expect(sm).toContain("min-h-control-sm");
    expect(sm).toContain("text-body");
  });
  it("renders a link when href is given", () => {
    expect(html(<Button href="/home">ไป</Button>)).toMatch(/<a[^>]*href="\/home"/);
  });
  it("lets long labels wrap", () => {
    expect(html(<Button>ป้ายยาว</Button>)).not.toContain("whitespace-nowrap");
  });
  it("supports fullWidth and iconOnly", () => {
    expect(html(<Button fullWidth>x</Button>)).toContain("w-full");
    expect(
      html(
        <Button iconOnly aria-label="ปิด">
          x
        </Button>,
      ),
    ).toContain("aspect-square");
  });
});

describe("Button as a disabled link", () => {
  it("renders no href when aria-disabled", () => {
    const out = html(
      <Button href="/home" aria-disabled="true">
        ไป
      </Button>,
    );
    expect(out).not.toContain("href=");
    expect(out).toContain('aria-disabled="true"');
    expect(out).toContain("min-h-control");
  });
  it("renders no href when disabled", () => {
    const out = html(
      <Button href="/home" disabled>
        ไป
      </Button>,
    );
    expect(out).not.toContain("href=");
    expect(out).toContain('aria-disabled="true"');
  });
  it("keeps the caller's attributes and drops link-only ones", () => {
    const out = html(
      <Button
        href="/home"
        disabled
        iconOnly
        aria-label="ย้อนกลับ"
        id="back"
        data-x="1"
        title="t"
        target="_blank"
        rel="noopener"
      >
        <svg />
      </Button>,
    );
    expect(out).toContain('aria-label="ย้อนกลับ"');
    expect(out).toContain('id="back"');
    expect(out).toContain('data-x="1"');
    expect(out).toContain('title="t"');
    expect(out).toContain('role="link"');
    expect(out).toContain('aria-disabled="true"');
    expect(out).toContain("aspect-square");
    expect(out).not.toMatch(/ href=| target=| rel=| disabled=/);
  });
  it("renders an enabled link without a disabled attribute", () => {
    const out = html(<Button href="/home">ไป</Button>);
    expect(out).toMatch(/<a[^>]*href="\/home"/);
    expect(out).not.toMatch(/ disabled[ =>]/);
  });
});
