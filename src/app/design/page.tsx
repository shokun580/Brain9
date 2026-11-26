import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { env } from "@/shared/lib/env";
import { isDesignPageEnabled } from "./enabled";
import { TOC } from "./toc";
import { AdminComponentsSection } from "./sections/AdminComponents";
import { ColoursSection } from "./sections/Colours";
import { DoDontSection } from "./sections/DoDont";
import { ElderComponentsSection } from "./sections/ElderComponents";
import { RecipesSection } from "./sections/Recipes";
import { StartHereSection } from "./sections/StartHere";
import { TypeSection } from "./sections/Type";

export const metadata: Metadata = { title: "ระบบออกแบบ", robots: { index: false } };

/**
 * The live design-system catalogue. Static on purpose: no cookies, database or session, so it
 * prerenders. It sits outside both `data-ui` scopes: the page chrome uses the admin scope and
 * each demo carries its own scope element.
 */
export default function DesignPage() {
  // Read at build time for a static page: the production build prerenders a 404.
  if (!isDesignPageEnabled(env().APP_ENV)) notFound();

  return (
    <div data-ui="admin" className="min-h-dvh bg-surface text-fg">
      <main className="mx-auto max-w-[64rem] px-4 py-8">
        <h1 className="text-title font-bold">ระบบออกแบบ Brain9</h1>
        <nav aria-label="สารบัญ" className="mt-4">
          <ol className="m-0 flex list-none flex-wrap gap-x-5 gap-y-1 p-0">
            {TOC.map((part) => (
              <li key={part.id}>
                <a href={`#${part.id}`} className="text-body text-primary-press underline">
                  {part.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="mt-8">
          <StartHereSection />
          <ColoursSection />
          <TypeSection />
          <ElderComponentsSection />
          <AdminComponentsSection />
          <RecipesSection />
          <DoDontSection />
        </div>
      </main>
    </div>
  );
}
