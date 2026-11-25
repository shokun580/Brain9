import { describe, expect, it } from "vitest";
import { html } from "../../../test/render";
import { BrandMark } from "./BrandMark";

describe("BrandMark", () => {
  it("draws one 64x64 svg with a tile and nine cells", () => {
    const out = html(<BrandMark />);
    expect(out.match(/<svg/g)).toHaveLength(1);
    expect(out).toContain('viewBox="0 0 64 64"');
    expect(out.match(/<rect/g)).toHaveLength(10);
  });

  it("is decorative by default", () => {
    const out = html(<BrandMark />);
    expect(out).toContain('aria-hidden="true"');
    expect(out).not.toContain('role="img"');
  });

  it("gets a name when a label is passed", () => {
    const out = html(<BrandMark label="Brain9" />);
    expect(out).toContain('role="img"');
    expect(out).toContain('aria-label="Brain9"');
    expect(out).not.toContain("aria-hidden");
  });

  it("is size-10 unless a className says otherwise", () => {
    expect(html(<BrandMark />)).toContain("size-10");
    const sized = html(<BrandMark className="size-9" />);
    expect(sized).toContain("size-9");
    expect(sized).not.toContain("size-10");
  });

  it("takes its colours from the tokens, never a hex value", () => {
    const out = html(<BrandMark />);
    expect(out).toContain("fill-primary");
    expect(out).toContain("fill-on-primary");
    expect(out).not.toContain("#");
  });
});
