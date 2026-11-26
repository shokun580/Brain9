import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export type ElderHeaderProps = {
  /** Page title. Use this OR `greeting` + `name`. */
  title?: string;
  greeting?: string;
  name?: string;
  /** Where "ย้อนกลับ" goes. Use this OR `onBack`. */
  backHref?: string;
  /** For a step kept in the state of a client component: "ย้อนกลับ" is then a button. */
  onBack?: () => void;
  /** One ghost pill action, e.g. the text-size button. */
  action?: ReactNode;
};

// `mb-3` keeps the pill clear of the title under it: they are two things, not one block.
const backClass =
  "mb-3 inline-flex min-h-control-sm items-center gap-1 rounded-full border-[length:var(--b9-border)] border-line-strong px-4 text-small font-bold text-fg";

/** Top bar of an elderly screen; its title is the page's h1. */
export function ElderHeader({ title, greeting, name, backHref, onBack, action }: ElderHeaderProps) {
  const heading = title ?? name ?? greeting;
  const back = (
    <>
      <ChevronLeft aria-hidden="true" className="size-icon-sm shrink-0" />
      ย้อนกลับ
    </>
  );
  return (
    <header className="flex min-h-control flex-wrap items-center justify-between gap-x-3 gap-y-2">
      {/* The text keeps a readable minimum width: when the action does not fit beside it, the
          action wraps onto its own line instead of squeezing the words. */}
      <div className="min-w-0 flex-1 basis-40">
        {backHref ? (
          <Link href={backHref} className={backClass}>
            {back}
          </Link>
        ) : onBack ? (
          <button type="button" onClick={onBack} className={backClass}>
            {back}
          </button>
        ) : null}
        {greeting && heading !== greeting ? (
          <p className="text-small text-fg-muted">{greeting}</p>
        ) : null}
        {heading ? <h1 className="text-heading font-bold text-fg">{heading}</h1> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
