import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

/** Exported values (not types) whose name starts with an upper-case letter: the components. */
function exportedComponents(source: string): string[] {
  const names = new Set<string>();
  for (const block of source.matchAll(/export\s*\{([^}]*)\}\s*from/g)) {
    for (const part of (block[1] ?? "").split(",")) {
      const entry = part.trim();
      if (!entry || entry.startsWith("type ")) continue;
      const name =
        entry
          .split(/\s+as\s+/)
          .pop()
          ?.trim() ?? "";
      if (/^[A-Z]/.test(name)) names.add(name);
    }
  }
  return [...names];
}

describe("docs/design-system.md", () => {
  const components = exportedComponents(read("src/shared/ui/index.ts"));
  const doc = read("docs/design-system.md");

  it("finds the components exported by the shared UI kit", () => {
    expect(components.length).toBeGreaterThan(30);
    expect(components).toContain("Button");
  });

  it.each(components)("documents %s", (name) => {
    expect(doc).toContain(`\`${name}\``);
  });
});
