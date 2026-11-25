import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

/**
 * Components that are exported from `@/shared/ui` but have no live demo on `/design`.
 * Keep this list as short as possible: a name here is invisible to anyone who builds a
 * screen from the catalogue.
 */
const NOT_DEMOED: Record<string, string> = {
  // The frame of the whole /admin area (fixed top bar and menu rail): it cannot sit inside a
  // page. The page links to /admin instead.
  AdminShell: "frame of /admin; linked, not nested",
  // The same bar as TabBarView plus `usePathname()` for the active tab. The demo renders
  // TabBarView (which is demoed); src/app/(elder)/layout.tsx is the one place that mounts TabBar.
  TabBar: "TabBarView plus the router's pathname; its view is demoed",
};

/** Every exported value (not `type`) whose name starts with an upper-case letter. */
function exportedComponents(): string[] {
  const source = readFileSync(join(root, "src/shared/ui/index.ts"), "utf8");
  const names: string[] = [];
  for (const match of source.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of (match[1] ?? "").split(",")) {
      const name = part.trim();
      if (!name || name.startsWith("type ")) continue;
      if (/^[A-Z]/.test(name)) names.push(name);
    }
  }
  return names;
}

/** The text of every `importLine="…"` (prettier may pick single quotes when the text holds `"`). */
function importLines(): string[] {
  const dir = join(root, "src/app/design/sections");
  const lines: string[] = [];
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".tsx") || file.endsWith(".test.tsx")) continue;
    const source = readFileSync(join(dir, file), "utf8");
    for (const match of source.matchAll(/importLine=(?:"([^"]*)"|'([^']*)')/g)) {
      lines.push(match[1] ?? match[2] ?? "");
    }
  }
  return lines;
}

describe("the /design catalogue", () => {
  const components = exportedComponents();
  const lines = importLines();

  it("finds the components it is meant to check", () => {
    expect(components).toContain("Button");
    expect(components).toContain("RowActions");
    expect(lines.length).toBeGreaterThan(30);
  });

  it("shows every exported component, or explains why not", () => {
    const missing = components.filter(
      (name) =>
        !(name in NOT_DEMOED) && !lines.some((line) => new RegExp(`\\b${name}\\b`).test(line)),
    );
    expect(missing).toEqual([]);
  });

  it("keeps NOT_DEMOED honest: every entry is still exported and still undemoed", () => {
    for (const name of Object.keys(NOT_DEMOED)) {
      expect(components, name).toContain(name);
      expect(
        lines.some((line) => new RegExp(`\\b${name}\\b`).test(line)),
        `${name} is demoed, remove it from NOT_DEMOED`,
      ).toBe(false);
    }
  });
});
