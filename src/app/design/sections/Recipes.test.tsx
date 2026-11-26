import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { html } from "../../../../test/render";
import { RECIPES, RecipesSection } from "./Recipes";

/** The `###` headings of section 5 ("Page recipes") of the design-system document. */
function documentRecipes(): string[] {
  const doc = readFileSync(join(process.cwd(), "docs/design-system.md"), "utf8");
  const start = doc.indexOf("\n## 5. ");
  const end = doc.indexOf("\n## 6. ", start);
  expect(start, "docs/design-system.md has a section 5").toBeGreaterThan(-1);
  expect(end, "docs/design-system.md has a section 6").toBeGreaterThan(start);
  return [...doc.slice(start, end).matchAll(/^### (.+)$/gm)].map((match) => match[1] ?? "");
}

// Headings of section 5 that are rules, not recipes.
const NOT_RECIPES = ["Admin rules"];

describe("the recipes on /design and in docs/design-system.md", () => {
  const onPage: string[] = RECIPES.map((recipe) => recipe.name);
  const inDocument = documentRecipes().filter((name) => !NOT_RECIPES.includes(name));

  it("finds the recipes it is meant to compare", () => {
    expect(onPage).toContain("Admin list page");
    expect(inDocument).toContain("Admin list page");
  });

  it("shows every recipe of the document on the page", () => {
    expect(inDocument.filter((name) => !onPage.includes(name))).toEqual([]);
  });

  it("documents every recipe of the page", () => {
    expect(onPage.filter((name) => !inDocument.includes(name))).toEqual([]);
  });

  it("renders every recipe it lists", () => {
    const markup = html(<RecipesSection />);
    expect(RECIPES.filter((recipe) => !markup.includes(recipe.title))).toEqual([]);
  });
});
