"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { NAV_TYPES } from "@/shared/lib/motion";
import { isActivePath } from "@/shared/lib/nav";

export type TabBarItem = { href: string; label: string; icon: ReactNode };

export type TabBarProps = {
  items: TabBarItem[];
  /** Paths (and their children) where the bar is not shown, e.g. a full-screen exercise. */
  hideOn?: string[];
};

/**
 * Bottom navigation of the elderly screens. It sits in the document flow with
 * `position: sticky; bottom: 0` at the end of a `min-h-dvh` flex column, so it stays at the
 * bottom of the viewport yet always takes its real height: at the largest text size the labels
 * wrap inside equal-width columns and the bar grows, never clipping and never covering content.
 */
export function TabBar(props: TabBarProps) {
  // `null` outside a router (and while a dynamic route is unresolved): show the bar, no active tab.
  return <TabBarView {...props} pathname={usePathname()} />;
}

export type TabBarViewProps = TabBarProps & { pathname: string | null };

/** The bar itself, free of router hooks: also the Suspense fallback of `TabBar` (no active tab). */
export function TabBarView({ items, pathname, hideOn = [] }: TabBarViewProps) {
  if (pathname && hideOn.some((href) => isActivePath(pathname, href))) return null;

  return (
    <nav
      aria-label="เมนูหลัก"
      // Named so the bar stays put while the page area fades (see globals.css).
      style={{
        gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
        viewTransitionName: "elder-tabbar",
      }}
      className="sticky bottom-0 z-10 grid border-t-[length:var(--b9-border)] border-line bg-surface px-1.5 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      {items.map((item) => {
        const active = pathname !== null && isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            transitionTypes={[NAV_TYPES.tab]}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-12 min-w-0 flex-col items-center gap-1 rounded-control px-0.5 text-center text-micro leading-tight font-bold [overflow-wrap:anywhere]",
              active ? "text-primary" : "text-fg-2",
            )}
          >
            <span
              className={cn(
                "grid h-9 w-16 shrink-0 place-items-center rounded-full",
                active ? "bg-primary-soft text-primary-press" : "",
              )}
            >
              <span aria-hidden="true" className="grid size-icon place-items-center">
                {item.icon}
              </span>
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
