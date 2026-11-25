import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/shared/lib/contrast";

// Prettier lower-cases hex colours, so compare case-insensitively.
const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8").toLowerCase();

const ROOT: Record<string, string> = {
  "--b9-page": "#F5F7F8",
  "--b9-surface": "#FFFFFF",
  "--b9-surface-subtle": "#F8FAFB",
  "--b9-surface-muted": "#EEF2F4",
  "--b9-fg": "#14202B",
  "--b9-fg-2": "#3B4854",
  "--b9-fg-muted": "#5A6873",
  "--b9-line": "#E1E7EA",
  "--b9-line-strong": "#C3CDD3",
  "--b9-primary": "#0B7A75",
  "--b9-primary-press": "#08625E",
  "--b9-primary-soft": "#E3F2F0",
  "--b9-primary-tint": "#BDE2DD",
  "--b9-primary-bright": "#4FD1C5",
  "--b9-on-primary": "#FFFFFF",
  "--b9-success": "#1E7A3C",
  "--b9-success-soft": "#E4F3E8",
  "--b9-danger": "#B42318",
  "--b9-danger-soft": "#FDECEA",
  "--b9-attention": "#9A5B00",
  "--b9-attention-soft": "#FFF1DC",
  "--b9-ink": "#122029",
};

/** Returns the body of the first top-level block whose selector matches `selector`. */
function block(selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`block not found: ${selector}`);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  throw new Error(`unterminated block: ${selector}`);
}

describe("design tokens", () => {
  const root = block(":root");

  it("declares every default colour with the exact spec value", () => {
    for (const [name, value] of Object.entries(ROOT)) {
      expect(root, name).toContain(`${name}: ${value.toLowerCase()};`);
    }
  });

  it("keeps the default colour pairs at WCAG AA (>= 4.5:1)", () => {
    const c = (name: string) => ROOT[`--b9-${name}`] as string;
    const pairs: [string, string][] = [
      [c("fg"), c("surface")],
      [c("fg"), c("page")],
      [c("fg-2"), c("surface")],
      [c("fg-muted"), c("surface")],
      [c("fg-muted"), c("page")],
      [c("on-primary"), c("primary")],
      [c("primary"), c("surface")],
      [c("primary-press"), c("primary-soft")],
      [c("success"), c("success-soft")],
      [c("danger"), c("danger-soft")],
      [c("attention"), c("attention-soft")],
      ["#FFFFFF", c("danger")],
      ["#FFFFFF", c("ink")],
    ];
    for (const [a, b] of pairs) {
      expect(contrastRatio(a, b), `${a} on ${b}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("defines the elder and admin scopes", () => {
    const elder = block('[data-ui="elder"]');
    expect(elder).toContain("--b9-text-title: calc(35px * var(--b9-scale));");
    expect(elder).toContain("--b9-control-h: 64px;");
    const admin = block('[data-ui="admin"]');
    expect(admin).toContain("--b9-text-body: 14.5px;");
    expect(admin).toContain("--b9-control-h: 36px;");
  });

  it("applies data-contrast and data-size only inside the elder scope", () => {
    const code = css.replace(/\/\*[\s\S]*?\*\//g, "");
    const selectors = [...code.matchAll(/([^{}]+)\{/g)]
      .map((m) => (m[1] ?? "").trim())
      .filter((s) => /data-contrast|data-size/.test(s));
    expect(selectors.length).toBeGreaterThan(0);
    for (const s of selectors) expect(s).toContain('[data-ui="elder"]');
  });

  it("sets the high-contrast primary and on-primary", () => {
    const high = block('html[data-contrast="high"] [data-ui="elder"]');
    expect(high).toContain("--b9-primary: #5eead4;");
    expect(high).toContain("--b9-on-primary: #000000;");
  });

  it("removes shadows in high contrast and keeps them elsewhere", () => {
    const high = block('html[data-contrast="high"] [data-ui="elder"]');
    for (const name of ["cell", "cell-lit", "overlay"]) {
      expect(high).toContain(`--b9-shadow-${name}: none;`);
      expect(root).toMatch(new RegExp(`--b9-shadow-${name}: [^n;][^;]*;`));
      expect(block("@theme inline")).toContain(`--shadow-${name}: var(--b9-shadow-${name});`);
    }
  });

  it("keeps text on danger readable, including high contrast", () => {
    const high = block('html[data-contrast="high"] [data-ui="elder"]');
    expect(root).toContain("--b9-on-danger: #ffffff;");
    expect(high).toContain("--b9-on-danger: #000000;");
    expect(block("@theme inline")).toContain("--color-on-danger: var(--b9-on-danger);");
    expect(contrastRatio("#000000", "#FF8A7E")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#FFFFFF", "#B42318")).toBeGreaterThanOrEqual(4.5);
  });

  it("references only var(--b9-*) inside @theme inline colours", () => {
    const theme = block("@theme inline");
    expect(theme).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});
