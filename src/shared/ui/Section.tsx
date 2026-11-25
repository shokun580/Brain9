import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export type SectionProps = {
  eyebrow?: string;
  title?: string;
  action?: ReactNode;
  /** The first section of a screen has no top line. */
  first?: boolean;
  children: ReactNode;
};

/** A block of an elderly screen: space plus a thin top line, never a card. */
export function Section({ eyebrow, title, action, first, children }: SectionProps) {
  return (
    <section
      className={cn(first ? "mt-5" : "mt-6 border-t-[length:var(--b9-border)] border-line pt-6")}
    >
      {eyebrow || title || action ? (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            {eyebrow ? <p className="text-small font-bold text-primary-press">{eyebrow}</p> : null}
            {title ? <h2 className="text-title font-bold text-fg">{title}</h2> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
