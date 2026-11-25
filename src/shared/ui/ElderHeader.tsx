import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export type ElderHeaderProps = {
  /** Page title. Use this OR `greeting` + `name`. */
  title?: string;
  greeting?: string;
  name?: string;
  backHref?: string;
  /** One ghost pill action, e.g. the text-size button. */
  action?: ReactNode;
};

/** Top bar of an elderly screen; its title is the page's h1. */
export function ElderHeader({ title, greeting, name, backHref, action }: ElderHeaderProps) {
  const heading = title ?? name;
  return (
    <header className="flex min-h-control flex-wrap items-center justify-between gap-x-3 gap-y-2">
      {/* The text keeps a readable minimum width: when the action does not fit beside it, the
          action wraps onto its own line instead of squeezing the words. */}
      <div className="min-w-0 flex-1 basis-40">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex min-h-control-sm items-center gap-1 rounded-full border-[length:var(--b9-border)] border-line-strong px-4 text-small font-bold text-fg"
          >
            <ChevronLeft aria-hidden="true" strokeWidth={1.9} className="size-icon-sm shrink-0" />
            ย้อนกลับ
          </Link>
        ) : null}
        {greeting ? <p className="text-small text-fg-muted">{greeting}</p> : null}
        {heading ? <h1 className="text-heading font-bold text-fg">{heading}</h1> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
