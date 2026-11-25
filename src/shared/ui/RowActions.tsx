import { Ellipsis } from "lucide-react";
import Link from "next/link";
import { useId } from "react";

export type RowAction = { label: string; href: string };

export type RowActionsProps = {
  primary: RowAction;
  more?: RowAction[];
  moreLabel?: string;
  /** Names the row for screen readers: "เพิ่มเติม: <rowLabel>". */
  rowLabel: string;
};

/**
 * Anchor names must be dashed idents; `useId` output contains characters that are not valid
 * in one, so keep letters, digits and hyphens only (the id itself is unique per instance).
 */
function anchorName(id: string): string {
  return `--row-actions-${id.replace(/[^a-zA-Z0-9]/g, "")}`;
}

/**
 * End-of-row control of an admin table: one text link, plus an optional "more" menu.
 * The menu is a native popover (`popover` + `popovertarget`): the browser opens and closes
 * it, so Escape and an outside click work with no state or client code. It is a plain list
 * of links and never performs an action itself; destructive actions live behind a page with
 * `ConfirmDialog`.
 *
 * Placement: where CSS anchor positioning is supported the list opens just below the button,
 * right-aligned with it. Elsewhere the browser's default applies and the list opens centred
 * in the viewport, which is still usable. No "use client": there are no handlers, and a
 * Server Component may call `useId`.
 */
export function RowActions({ primary, more, moreLabel = "เพิ่มเติม", rowLabel }: RowActionsProps) {
  const menuId = useId();
  const anchor = anchorName(menuId);
  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={primary.href}
        className="inline-flex min-h-control-sm items-center px-1 text-body font-bold text-primary-press underline"
      >
        {primary.label}
      </Link>
      {more && more.length > 0 ? (
        <>
          <button
            type="button"
            popoverTarget={menuId}
            aria-label={`${moreLabel}: ${rowLabel}`}
            style={{ anchorName: anchor }}
            className="inline-flex size-control-sm items-center justify-center rounded-control text-fg-2 hover:bg-surface-muted"
          >
            <Ellipsis aria-hidden="true" strokeWidth={1.9} className="size-icon" />
          </button>
          <ul
            id={menuId}
            popover="auto"
            aria-label={`${moreLabel}: ${rowLabel}`}
            style={{ positionAnchor: anchor }}
            className="min-w-44 rounded-control border border-[length:var(--b9-border)] border-line bg-surface p-1 text-fg supports-[position-area:bottom]:m-0 supports-[position-area:bottom]:mt-1 supports-[position-area:bottom]:[position-area:bottom_span-left]"
          >
            {more.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-control-sm items-center rounded-control px-3 text-body hover:bg-surface-muted"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
