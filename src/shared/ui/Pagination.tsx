import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { pageItems, pageRange } from "@/shared/lib/pagination";

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
  return (
    <nav
      aria-label="การแบ่งหน้า"
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3"
    >
      <p className="text-small text-fg-muted">{text}</p>
      {range.pageCount > 1 ? (
        <div className="flex flex-wrap items-center gap-1">
          <Step
            label="หน้าก่อนหน้า"
            href={range.page > 1 ? hrefFor(range.page - 1) : undefined}
            icon={<ChevronLeft aria-hidden="true" strokeWidth={1.9} className="size-icon-sm" />}
          />
          {pageItems(range.page, range.pageCount).map((item, i) =>
            item === "ellipsis" ? (
              <span key={`gap-${i}`} aria-hidden="true" className={cn(box, "text-fg-muted")}>
                …
              </span>
            ) : (
              <a
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
              </a>
            ),
          )}
          <Step
            label="หน้าถัดไป"
            href={range.page < range.pageCount ? hrefFor(range.page + 1) : undefined}
            icon={<ChevronRight aria-hidden="true" strokeWidth={1.9} className="size-icon-sm" />}
          />
        </div>
      ) : null}
    </nav>
  );
}

function Step({ label, href, icon }: { label: string; href: string | undefined; icon: ReactNode }) {
  return href ? (
    <a href={href} aria-label={label} className={cn(box, "text-fg-2 hover:bg-surface-muted")}>
      {icon}
    </a>
  ) : (
    <span aria-disabled="true" aria-label={label} className={cn(box, "text-fg-muted opacity-50")}>
      {icon}
    </span>
  );
}
