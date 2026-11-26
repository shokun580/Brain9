import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { pageItems, pageRange } from "@/shared/lib/pagination";

/**
 * `Pagination` clamps `page` into range, so it never tells the caller. Query with the same
 * clamped number or the footer and the table disagree:
 *
 *     const total = await db.thing.count();
 *     const r = pageRange(rawPage, pageSize, total);
 *     const rows = await db.thing.findMany({ skip: r.from === 0 ? 0 : r.from - 1, take: pageSize });
 *     <Pagination page={r.page} pageSize={pageSize} total={total} hrefFor={...} />
 */
export type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  hrefFor: (page: number) => string;
};

const box =
  "inline-flex min-h-control-sm min-w-control-sm items-center justify-center rounded-control px-2 text-body";

/** Footer of a list panel: the visible range, and page links when there is more than one page. */
export function Pagination({ page, pageSize, total, hrefFor }: PaginationProps) {
  const range = pageRange(page, pageSize, total);
  const text =
    range.pageCount === 0 ? "ไม่มีรายการ" : `แสดง ${range.from}–${range.to} จาก ${total} รายการ`;
  const count = <p className="text-small text-fg-muted">{text}</p>;
  // A landmark must lead somewhere: with no page controls the count is plain text.
  if (range.pageCount <= 1) return <div className="px-4 py-3">{count}</div>;
  return (
    <nav
      aria-label="การแบ่งหน้า"
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3"
    >
      {count}
      <div className="flex flex-wrap items-center gap-1">
        <Step
          label="หน้าก่อนหน้า"
          href={range.page > 1 ? hrefFor(range.page - 1) : undefined}
          icon={<ChevronLeft aria-hidden="true" className="size-icon-sm" />}
        />
        {pageItems(range.page, range.pageCount).map((item, i) =>
          item === "ellipsis" ? (
            <span key={`gap-${i}`} aria-hidden="true" className={cn(box, "text-fg-muted")}>
              …
            </span>
          ) : (
            <Link
              key={item}
              href={hrefFor(item)}
              aria-current={item === range.page ? "page" : undefined}
              className={cn(
                box,
                item === range.page
                  ? "bg-primary font-bold text-on-primary"
                  : "text-fg-2 hover:bg-surface-muted",
              )}
            >
              {item}
            </Link>
          ),
        )}
        <Step
          label="หน้าถัดไป"
          href={range.page < range.pageCount ? hrefFor(range.page + 1) : undefined}
          icon={<ChevronRight aria-hidden="true" className="size-icon-sm" />}
        />
      </div>
    </nav>
  );
}

function Step({ label, href, icon }: { label: string; href: string | undefined; icon: ReactNode }) {
  return href ? (
    <Link href={href} aria-label={label} className={cn(box, "text-fg-2 hover:bg-surface-muted")}>
      {icon}
    </Link>
  ) : (
    <span aria-disabled="true" className={cn(box, "text-fg-muted opacity-50")}>
      {icon}
      <span className="sr-only">{label}</span>
    </span>
  );
}
