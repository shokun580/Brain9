import type { ReactNode } from "react";
import { partTitle, type PartId } from "./toc";

/** One part of the page: anchor, heading and a one-line intro. Page chrome, in the admin scope. */
export function Part({ id, intro, children }: { id: PartId; intro?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mt-16 scroll-mt-6 first:mt-0">
      <header className="border-b-[length:var(--b9-border)] border-line-strong pb-2">
        <h2 id={`${id}-title`} data-outline className="text-title font-bold text-fg">
          {partTitle(id)}
        </h2>
        {intro ? <p className="mt-1 text-body text-fg-muted">{intro}</p> : null}
      </header>
      {children}
    </section>
  );
}

export function SubHeading({ children }: { children: ReactNode }) {
  return (
    <h3 data-outline className="mt-10 text-heading font-bold text-fg">
      {children}
    </h3>
  );
}

const frame = "rounded-panel border-[length:var(--b9-border)] border-line";

/** Elderly scope inside a frame, as wide as the real column (640px). */
export function ElderScope({ children }: { children: ReactNode }) {
  return (
    <div data-ui="elder" className={`${frame} max-w-[640px] bg-surface p-5 text-fg`}>
      {children}
    </div>
  );
}

/** Admin scope inside a frame. */
export function AdminScope({ children }: { children: ReactNode }) {
  return (
    <div data-ui="admin" className={`${frame} max-w-[860px] bg-surface p-4 text-fg`}>
      {children}
    </div>
  );
}
