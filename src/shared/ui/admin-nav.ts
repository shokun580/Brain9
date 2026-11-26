import type { ReactNode } from "react";
import { isActivePath } from "@/shared/lib/nav";

export type AdminNavItem = { href: string; label: string; icon: ReactNode; badge?: ReactNode };
export type AdminNavGroup = { label?: string; items: AdminNavItem[] };
export type AdminNavSection = {
  id: string;
  /** Title of the panel. */
  label: string;
  /** Short word under the rail icon; keep it to 8 characters or fewer. */
  railLabel: string;
  icon: ReactNode;
  groups: AdminNavGroup[];
};

/** Where a click on the section's rail icon goes: the first page of the first non-empty group. */
export function sectionHref(section: AdminNavSection): string {
  for (const group of section.groups) {
    const first = group.items[0];
    if (first) return first.href;
  }
  // A section without pages has nowhere to go; the admin home is the safe landing.
  return "/admin";
}

/** The page (and its section) that `pathname` belongs to: the longest matching href wins. */
export function findActiveNav(
  sections: AdminNavSection[],
  pathname: string | null,
): { sectionId: string; href: string } | null {
  if (!pathname) return null;
  let best: { sectionId: string; href: string } | null = null;
  for (const section of sections) {
    for (const group of section.groups) {
      for (const item of group.items) {
        if (!isActivePath(pathname, item.href)) continue;
        if (!best || item.href.length > best.href.length) {
          best = { sectionId: section.id, href: item.href };
        }
      }
    }
  }
  return best;
}
