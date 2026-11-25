import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { COLOUR_TOKENS } from "./colour-tokens";

// Prettier lower-cases hex colours, so compare case-insensitively.
const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8").toLowerCase();
const start = css.indexOf(":root {");
const root = css.slice(start, css.indexOf("\n}", start));

describe("colour token table", () => {
  it("mirrors the :root declaration of every listed token", () => {
    for (const token of COLOUR_TOKENS) {
      expect(root, token.cssVar).toContain(`${token.cssVar}: ${token.declared.toLowerCase()};`);
    }
  });

  it("gives every opaque hex token its hex value", () => {
    for (const token of COLOUR_TOKENS) {
      if (token.declared.startsWith("#")) expect(token.hex, token.cssVar).toBe(token.declared);
    }
  });

  it("lists every colour declared in :root", () => {
    const declared = [
      ...root.matchAll(
        /(--(?:b9-[a-z0-9-]+|chart-\d)):\s*(?:#[0-9a-f]{3,8}|rgb\([^)]*\)|transparent|var\(--b9-primary\))\s*;/g,
      ),
    ].map((match) => match[1]);
    const listed = COLOUR_TOKENS.map((token) => token.cssVar);
    expect(declared.length).toBeGreaterThan(30);
    expect(listed.sort()).toEqual([...declared].sort());
  });

  it("resolves chart-1 to the primary hex and points every contrast pair at a real token", () => {
    const byVar = new Map(COLOUR_TOKENS.map((token) => [token.cssVar, token]));
    expect(byVar.get("--chart-1")?.hex).toBe(byVar.get("--b9-primary")?.hex);
    for (const token of COLOUR_TOKENS) {
      if (token.against) expect(byVar.get(token.against)?.hex, token.cssVar).toBeDefined();
    }
  });
});
