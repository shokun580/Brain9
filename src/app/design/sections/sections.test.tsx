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

describe("the catalogue", () => {
  it("has one section per entry of the table of contents", () => {
    expect(sections.map(([id]) => id)).toEqual(TOC.map((part) => part.id));
  });

  it("keeps every element id unique across the page", () => {
    // One render, as on the page: useId numbers restart with every render.
    const markup = html(
      <>
        {sections.map(([id, Section]) => (
          <Section key={id} />
        ))}
      </>,
    );
    const ids = [...markup.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    const seen = new Set<string>();
    const repeated = ids.filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
    expect(repeated).toEqual([]);
  });
});
