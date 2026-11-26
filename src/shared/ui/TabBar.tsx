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
 * Bottom navigation of the elderly screens: a floating bar, rounded and raised, whose current
 * tab is a soft block covering the whole tab (never colour alone).
 *
 * The strip around the bar sits in the document flow with `position: sticky; bottom: 0` at the
 * end of a `min-h-dvh` flex column, so it stays at the bottom of the viewport yet always takes
 * its real height: at the largest text size the labels wrap inside equal-width columns and the
 * bar grows and never clips. The strip has no background and lets taps through, so the page
 * shows and stays usable around the bar while it scrolls behind it; because the strip is in
 * the flow, the end of the page always comes to rest above the bar, never under it.
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
      style={{ viewTransitionName: "elder-tabbar" }}
      className="pointer-events-none sticky bottom-0 z-10 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
        className="pointer-events-auto grid gap-0.5 rounded-panel border-[length:var(--b9-border)] border-line-strong bg-surface p-2 shadow-dock"
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
                "flex min-h-12 min-w-0 flex-col items-center gap-0.5 rounded-control pt-2 pb-2.5 text-center text-micro leading-tight font-bold [overflow-wrap:anywhere]",
                active ? "bg-primary-soft text-primary-press" : "text-fg-2",
              )}
            >
              <span aria-hidden="true" className="grid h-8 shrink-0 place-items-center">
                <span className="grid size-icon place-items-center">{item.icon}</span>
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
