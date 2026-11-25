import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export type PanelProps = {
  title?: string;
  /** Quiet text after the title, e.g. "128 รายการ". */
  count?: string;
  action?: ReactNode;
  /** False for content that runs edge to edge, such as a table. Defaults to true. */
  padded?: boolean;
  children: ReactNode;
};

/** A white panel on the page: optional header row (title, count, action) above the body. */
export function Panel({ title, count, action, padded = true, children }: PanelProps) {
  return (
    <section className="rounded-panel border-[length:var(--b9-border)] border-line bg-surface">
      {title || action ? (
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b-[length:var(--b9-border)] border-line px-4 py-3">
          <div className="flex min-w-0 flex-1 basis-40 items-baseline gap-2">
            {title ? <h2 className="text-heading font-bold text-fg">{title}</h2> : null}
            {count ? <span className="text-small text-fg-muted">{count}</span> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className={cn(padded && "p-4")}>{children}</div>
    </section>
  );
}
