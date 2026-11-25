import type { ReactNode } from "react";

export type TableCardProps = {
  /** Filters and search, above the table. */
  toolbar?: ReactNode;
  /** Usually a `Pagination`, below the table. */
  footer?: ReactNode;
  children: ReactNode;
};

/** Thin-bordered container for a table, with its filters on top and pager at the bottom. */
export function TableCard({ toolbar, footer, children }: TableCardProps) {
  return (
    <div className="overflow-hidden rounded-panel border border-line bg-surface">
      {toolbar ? (
        <div className="flex flex-wrap gap-2 border-b border-line p-3">{toolbar}</div>
      ) : null}
      {children}
      {footer ? <div className="border-t border-line px-4 py-2.5">{footer}</div> : null}
    </div>
  );
}
