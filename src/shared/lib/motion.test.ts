import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { NAV_TYPES, pageEnter, pageExit, panelEnter, revealEnter, revealExit } from "./motion";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

describe("motion constants", () => {
  it("names the three navigation types", () => {
    expect(NAV_TYPES).toEqual({ section: "b9-section", page: "b9-page", tab: "b9-tab" });
  });

  it("animates only typed navigations and defaults to none", () => {
    for (const type of Object.values(NAV_TYPES)) {
      expect(pageEnter[type]).toBe("b9-page-in");
      expect(pageExit[type]).toBe("b9-page-out");
    }
    expect(pageEnter.default).toBe("none");
    expect(pageExit.default).toBe("none");
    expect(panelEnter).toEqual({ "b9-section": "b9-panel-in", default: "none" });
  });

  it("only uses class names that globals.css styles", () => {
    const names = new Set<string>([
      ...Object.values(pageEnter),
      ...Object.values(pageExit),
      ...Object.values(panelEnter),
      revealEnter,
      revealExit,
    ]);
    names.delete("none");
    expect(names.size).toBeGreaterThan(0);
    for (const name of names) {
      expect(css, name).toMatch(new RegExp(`::view-transition-(old|new)\\(\\.${name}\\)`));
    }
  });
});
