import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { html } from "../../../../test/render";
import { TOC, type PartId } from "../toc";
import { AdminComponentsSection } from "./AdminComponents";
import { ColoursSection } from "./Colours";
import { DoDontSection } from "./DoDont";
import { ElderComponentsSection } from "./ElderComponents";
import { RecipesSection } from "./Recipes";
import { StartHereSection } from "./StartHere";
import { TypeSection } from "./Type";

const sections: [PartId, () => ReactElement][] = [
  ["start", StartHereSection],
  ["colours", ColoursSection],
  ["type", TypeSection],
  ["elder", ElderComponentsSection],
  ["admin", AdminComponentsSection],
  ["recipes", RecipesSection],
  ["dodont", DoDontSection],
];

describe.each(sections)("section %s", (id, Section) => {
  const title = TOC.find((part) => part.id === id)?.title ?? "";

  it("renders without throwing and shows its own heading", () => {
    const markup = html(<Section />);
    expect(title).not.toBe("");
    expect(markup).toContain(`id="${id}"`);
    expect(markup).toContain(title);
  });
});

function wholePage() {
  return html(
    <>
      {sections.map(([id, Section]) => (
        <Section key={id} />
      ))}
    </>,
  );
}

describe("the catalogue", () => {
  it("keeps the page chrome's heading levels from jumping by more than one", () => {
    // Headings inside demos belong to the components shown; only the chrome is checked.
    const levels = [...wholePage().matchAll(/<h([2-6])[^>]*data-outline/g)].map((m) =>
      Number(m[1]),
    );
    expect(levels.length).toBeGreaterThan(40);
    let previous = 1; // the page's own h1
    for (const level of levels) {
      expect(level, `h${level} after h${previous}`).toBeLessThanOrEqual(previous + 1);
      previous = level;
    }
  });

  it("points every in-page link at an element that exists", () => {
    const markup = wholePage();
    const ids = new Set([...markup.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    const targets = [...markup.matchAll(/\shref="#([^"]*)"/g)].map((m) => m[1] ?? "");
    expect(targets.length).toBeGreaterThan(10);
    expect(targets.filter((target) => !ids.has(target))).toEqual([]);
  });

  it("links the table of contents to real parts", () => {
    const ids = new Set([...wholePage().matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    expect(TOC.filter((part) => !ids.has(part.id))).toEqual([]);
  });

  it("has one section per entry of the table of contents", () => {
    expect(sections.map(([id]) => id)).toEqual(TOC.map((part) => part.id));
  });

  it("keeps every element id unique across the page", () => {
    // One render, as on the page: useId numbers restart with every render.
    const markup = wholePage();
    const ids = [...markup.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    const seen = new Set<string>();
    const repeated = ids.filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
    expect(repeated).toEqual([]);
  });
});
