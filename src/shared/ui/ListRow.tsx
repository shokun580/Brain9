import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export type ListRowProps = {
  href: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  badge?: ReactNode;
};

/** A whole row is the link. The chevron is the one icon allowed without its own text label. */
export function ListRow({ href, title, subtitle, icon, badge }: ListRowProps) {
  return (
    <Link
      href={href}
      className="flex min-h-control items-center gap-4 border-b-[length:var(--b9-border)] border-line py-4 text-fg active:bg-surface-muted"
    >
      {icon ? <span className="shrink-0 text-fg-2">{icon}</span> : null}
      <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
        <span className="text-body font-bold">{title}</span>
        {subtitle ? <span className="text-small text-fg-muted">{subtitle}</span> : null}
        {badge ? <span className="mt-1.5">{badge}</span> : null}
      </span>
      <ChevronRight aria-hidden="true" className="size-icon shrink-0 text-fg-muted" />
    </Link>
  );
}
