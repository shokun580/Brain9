import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";

// Prettier puts each selector of the combined default block on its own line.
const BASE = ':root,\n[data-ui="elder"]';

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
  "--b9-on-ink": "#FFFFFF",
  "--b9-on-ink-2": "#C5D0D6",
  "--b9-on-ink-muted": "#9FB0B9",
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
      [c("on-ink"), c("ink")],
      [c("on-ink-2"), c("ink")],
      [c("on-ink-muted"), c("ink")],
    ];
    for (const [a, b] of pairs) {
      expect(contrastRatio(a, b), `${a} on ${b}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("defines the elder and admin scopes", () => {
    const elder = block(BASE);
    expect(elder).toContain("--b9-text-title: calc(35px * var(--b9-scale));");
    expect(elder).toContain("--b9-control-h: 64px;");
    const admin = block('[data-ui="admin"]');
    expect(admin).toContain("--b9-text-body: 14.5px;");
    expect(admin).toContain("--b9-control-h: 36px;");
  });

  it("gives unscoped pages the elder sizes without touching the root font size", () => {
    const base = block(BASE);
    expect(base).toContain("--b9-text-body: calc(20px * var(--b9-scale));");
    expect(base).toContain("--b9-control-h: 64px;");
    expect(base).toContain("--b9-radius-control: 18px;");
    const code = css.replace(/\/\*[\s\S]*?\*\//g, "");
    for (const m of code.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const selector = (m[1] ?? "").trim();
      if (/^(:root|html)(\s*,.*)?$/.test(selector) && !selector.includes("[data-ui")) {
        expect(m[2], selector).not.toMatch(/font-size/);
      }
    }
    expect(css).toMatch(/\n\[data-ui="elder"\] \{\s*font-size: var\(--b9-text-body\);/);
  });

  it("documents why primary on primary-soft is forbidden", () => {
    // Text on primary-soft is primary-press (asserted above); plain primary misses AA.
    expect(
      contrastRatio(ROOT["--b9-primary"] as string, ROOT["--b9-primary-soft"] as string),
    ).toBeLessThan(4.5);
  });

  it("defines the edge token, visible only in high contrast", () => {
    const high = block('html[data-contrast="high"] [data-ui="elder"]');
    expect(root).toContain("--b9-edge: transparent;");
    expect(high).toContain("--b9-edge: #ffffff;");
    expect(block("@theme inline")).toContain("--color-edge: var(--b9-edge);");
  });

  it("maps the admin menu text colours that sit on ink", () => {
    const theme = block("@theme inline");
    for (const name of ["on-ink", "on-ink-2", "on-ink-muted"]) {
      expect(theme).toContain(`--color-${name}: var(--b9-${name});`);
    }
  });

  it("defines icon sizes per scope and maps them to size utilities", () => {
    const base = block(BASE);
    expect(base).toContain("--b9-icon: 24px;");
    expect(base).toContain("--b9-icon-sm: 22px;");
    const admin = block('[data-ui="admin"]');
    expect(admin).toContain("--b9-icon: 18px;");
    expect(admin).toContain("--b9-icon-sm: 16px;");
    const theme = block("@theme inline");
    expect(theme).toContain("--spacing-icon: var(--b9-icon);");
    expect(theme).toContain("--spacing-icon-sm: var(--b9-icon-sm);");
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

  describe("motion, skeleton and admin navigation tokens", () => {
    const flat = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ");

    it("keeps the motion durations on :root so view-transition pseudo-elements inherit them", () => {
      expect(root).toContain("--b9-motion-enter: 300ms;");
      expect(root).toContain("--b9-motion-exit: 100ms;");
    });

    it("defines the skeleton colours, with a high-contrast override", () => {
      expect(root).toContain("--b9-skeleton: #e3e9ec;");
      expect(root).toContain("--b9-skeleton-shine: #f6f9fa;");
      const high = block('html[data-contrast="high"] [data-ui="elder"]');
      expect(high).toContain("--b9-skeleton: #3a3a3a;");
      expect(high).toContain("--b9-skeleton-shine: #5a5a5a;");
    });

    it("defines the admin navigation colours without raw hex inside @theme", () => {
      expect(root).toContain("--b9-nav-rail: #0c161d;");
      expect(root).toContain("--b9-nav-fill: rgb(255 255 255 / 0.1);");
      expect(root).toContain("--b9-nav-line: rgb(255 255 255 / 0.14);");
      const theme = block("@theme inline");
      for (const name of ["skeleton", "skeleton-shine", "nav-rail", "nav-fill", "nav-line"]) {
        expect(theme).toContain(`--color-${name}: var(--b9-${name});`);
      }
      expect(theme).toContain("--container-admin: 53.75rem;");
    });

    it("keeps the menu text colours readable on the rail", () => {
      for (const name of ["on-ink", "on-ink-2", "on-ink-muted"]) {
        expect(
          contrastRatio(ROOT[`--b9-${name}`] as string, "#0C161D"),
          name,
        ).toBeGreaterThanOrEqual(4.5);
      }
    });

    it("defines the shimmer and the noscript variant", () => {
      expect(flat).toContain("@custom-variant noscript (@media (scripting: none));");
      expect(flat).toContain("@utility animate-skeleton {");
      expect(flat).toContain("b9-skeleton-shimmer 1.5s linear infinite");
      expect(flat).toContain("@keyframes b9-skeleton-shimmer");
    });

    it("lets clicks through the view-transition overlay", () => {
      expect(flat).toContain("::view-transition { pointer-events: none; }");
    });

    it("defines the page, panel and reveal transition rules", () => {
      expect(flat).toContain("::view-transition-new(.b9-page-in)");
      expect(flat).toContain("::view-transition-old(.b9-page-out)");
      expect(flat).toContain("::view-transition-new(.b9-panel-in)");
      expect(flat).toContain("::view-transition-new(.b9-content-in)");
      expect(flat).toContain("::view-transition-old(.b9-skeleton-out)");
    });

    it("anchors the chrome so it never animates", () => {
      for (const name of ["admin-topbar", "elder-tabbar"]) {
        const rule = (part: string, body: string) =>
          new RegExp(`::view-transition-${part}\\(${name}\\)[^{}]*\\{ ${body} \\}`);
        expect(flat, name).toMatch(rule("group", "animation: none; z-index: 100;"));
        expect(flat, name).toMatch(rule("old", "display: none;"));
        expect(flat, name).toMatch(rule("new", "animation: none;"));
      }
    });

    it("keeps the unnamed chrome still by neutralising the root snapshot, and names no menu", () => {
      expect(flat).toContain("::view-transition-old(root) { display: none; }");
      expect(flat).toContain("::view-transition-new(root) { animation: none; }");
      expect(flat).not.toContain("admin-nav)");
    });

    it("removes view-transition motion under prefers-reduced-motion", () => {
      expect(flat).toMatch(
        /@media \(prefers-reduced-motion: reduce\) \{[^@]*::view-transition-old\(\*\), ::view-transition-new\(\*\), ::view-transition-group\(\*\) \{ animation-duration: 0s !important;/,
      );
      expect(flat).toMatch(
        /\*, \*::before, \*::after \{[^}]*animation-iteration-count: 1 !important;/,
      );
    });
  });
});

describe("brand icon", () => {
  const token = (name: string) =>
    new RegExp(`${name}:\\s*(#[0-9a-f]{6})`).exec(css)?.[1] ?? "missing";

  it("is the same drawing with the literal colours of the primary tokens", () => {
    const icon = readFileSync(join(process.cwd(), "src/app/icon.svg"), "utf8").toLowerCase();
    expect(icon).toContain(`fill="${token("--b9-primary")}"`);
    expect(icon).toContain(`fill="${token("--b9-on-primary")}"`);
    expect(icon.match(/<rect/g)).toHaveLength(10);
  });
});
