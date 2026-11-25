export type PageRange = { page: number; from: number; to: number; pageCount: number };

/** Floors a count; anything that is not a finite number at or above `min` becomes `fallback`. */
function whole(value: number, min: number, fallback: number): number {
  return Number.isFinite(value) && value >= min ? Math.floor(value) : fallback;
}

/**
 * Which rows page `page` covers (1-based, inclusive). Total: bad input never throws or yields
 * NaN — a pageSize below 1 counts as 1, a bad total as 0, and the page is clamped into range.
 */
export function pageRange(page: number, pageSize: number, total: number): PageRange {
  const size = whole(pageSize, 1, 1);
  const count = whole(total, 0, 0);
  const pageCount = Math.ceil(count / size);
  if (pageCount === 0) return { page: 1, from: 0, to: 0, pageCount: 0 };
  const current = Math.min(Math.max(whole(page, 1, 1), 1), pageCount);
  return {
    page: current,
    from: (current - 1) * size + 1,
    to: Math.min(current * size, count),
    pageCount,
  };
}

/** Page numbers to show: first, last, the current page and its neighbours, gaps as "ellipsis". */
export function pageItems(page: number, pageCount: number): (number | "ellipsis")[] {
  const last = whole(pageCount, 0, 0);
  if (last === 0) return [];
  const current = Math.min(Math.max(whole(page, 1, 1), 1), last);
  const shown = [...new Set([1, current - 1, current, current + 1, last])]
    .filter((n) => n >= 1 && n <= last)
    .sort((a, b) => a - b);
  const items: (number | "ellipsis")[] = [];
  shown.forEach((n, i) => {
    const before = shown[i - 1];
    if (before !== undefined && n - before > 1) items.push("ellipsis");
    items.push(n);
  });
  return items;
}
