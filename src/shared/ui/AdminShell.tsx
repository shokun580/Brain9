"use client";

import { ChevronsLeft, CircleHelp, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { isActivePath } from "@/shared/lib/nav";

export type AdminNavItem = { href: string; label: string; icon: ReactNode; badge?: string };
export type AdminNavGroup = { label?: string; items: AdminNavItem[] };

export type AdminShellProps = {
  brand: string;
  roleLabel: string;
  nav: AdminNavGroup[];
  /** Name and role of the signed-in admin. Nothing else about the person belongs here. */
  user?: ReactNode;
  centerSlot?: ReactNode;
  footer?: ReactNode;
  /** The help link is rendered only when there is somewhere to go. */
  helpHref?: string;
  children: ReactNode;
};

// The menu has three states on the root's `data-menu`: "open", "closed", and "auto" (nobody
// has pressed a toggle yet). "auto" is the server-rendered default: expanded from 1024px up,
// the icon rail below it. It is decided by CSS, so there is no flash and no layout jump, and
// without JavaScript the menu is still visible and every link works.
const HIDE_IN_RAIL =
  "group-data-[menu=closed]/shell:hidden group-data-[menu=auto]/shell:max-lg:hidden";
const SHOW_IN_RAIL =
  "hidden group-data-[menu=closed]/shell:block group-data-[menu=auto]/shell:max-lg:block";
const CENTER_IN_RAIL =
  "group-data-[menu=closed]/shell:justify-center group-data-[menu=auto]/shell:max-lg:justify-center";
const FLIP_IN_RAIL =
  "group-data-[menu=closed]/shell:rotate-180 group-data-[menu=auto]/shell:max-lg:rotate-180";

/** Name of the bottom button: it collapses an open menu and expands the rail. */
export function collapseLabel(open: boolean): string {
  return open ? "ย่อเมนู" : "ขยายเมนู";
}

const WIDE_QUERY = "(min-width: 1024px)";

function subscribeToWidth(onChange: () => void) {
  const query = window.matchMedia(WIDE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Whether the menu is expanded by default at the current width (matches the CSS above). */
function useWide(): boolean {
  return useSyncExternalStore(
    subscribeToWidth,
    () => window.matchMedia(WIDE_QUERY).matches,
    // Below 1024px the server HTML says "open" until hydration corrects it (the cost of the
    // no-flash CSS default).
    () => true,
  );
}

function MenuLinks({ nav, pathname }: { nav: AdminNavGroup[]; pathname: string | null }) {
  return (
    <>
      {nav.map((group, index) => (
        <div key={group.label ?? `group-${index}`} className="flex flex-col gap-0.5">
          {group.label ? (
            <>
              <p
                className={cn(
                  "px-2.5 pt-4 pb-1.5 text-micro font-bold tracking-wide text-on-ink-muted",
                  HIDE_IN_RAIL,
                )}
              >
                {group.label}
              </p>
              <div aria-hidden="true" className={cn("mx-2 my-2 h-px bg-on-ink/10", SHOW_IN_RAIL)} />
            </>
          ) : null}
          {group.items.map((item) => {
            const active = pathname !== null && isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-control items-center gap-3 rounded-control px-2.5 py-2 text-body transition-colors duration-150 ease-out hover:bg-on-ink/[0.06] hover:text-on-ink",
                  CENTER_IN_RAIL,
                  active
                    ? "bg-on-ink/[0.09] font-bold text-on-ink before:absolute before:inset-y-1.5 before:-left-2.5 before:w-[3px] before:rounded-r-[3px] before:bg-primary-bright"
                    : "text-on-ink-2",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-icon shrink-0 place-items-center",
                    active ? "text-primary-bright" : "text-on-ink-muted",
                  )}
                >
                  {item.icon}
                </span>
                <span className={cn("min-w-0 flex-1 [overflow-wrap:anywhere]", HIDE_IN_RAIL)}>
                  {item.label}
                </span>
                {item.badge ? (
                  <span
                    className={cn(
                      "rounded-full bg-attention-soft px-2 text-micro font-bold text-attention",
                      HIDE_IN_RAIL,
                    )}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );
}

/** Reads the path in its own client leaf so a suspending `usePathname` cannot blank the shell. */
function ActiveMenuLinks({ nav }: { nav: AdminNavGroup[] }) {
  // `null` outside a router: render the menu, mark nothing.
  const pathname = usePathname();
  return <MenuLinks nav={nav} pathname={pathname} />;
}

/**
 * Frame of every admin page: a dark grouped menu on the left, a 56px top bar and the content.
 * The page owns its own `<h1>` (PageHeader); the shell never renders one.
 */
export function AdminShell({
  brand,
  roleLabel,
  nav,
  user,
  centerSlot,
  footer = "Brain9 ระบบฝึกสมองผู้สูงอายุ",
  helpHref,
  children,
}: AdminShellProps) {
  // null until a toggle is pressed: then CSS decides (see above). After that the user decides.
  const [chosen, setChosen] = useState<boolean | null>(null);
  const wide = useWide();
  const open = chosen ?? wide;
  const toggle = () => setChosen(!open);

  return (
    <div
      data-ui="admin"
      data-menu={chosen === null ? "auto" : chosen ? "open" : "closed"}
      className="group/shell flex min-h-dvh bg-page text-fg"
    >
      <aside className="sticky top-0 flex h-dvh w-60 shrink-0 flex-col bg-ink text-on-ink-2 transition-[width] duration-200 ease-out [--b9-focus:var(--b9-primary-bright)] group-data-[menu=auto]/shell:max-lg:w-16 group-data-[menu=closed]/shell:w-16">
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-on-ink/10 px-4 group-data-[menu=auto]/shell:max-lg:justify-center group-data-[menu=auto]/shell:max-lg:px-0 group-data-[menu=closed]/shell:justify-center group-data-[menu=closed]/shell:px-0">
          <span
            aria-hidden="true"
            className="grid size-7 shrink-0 place-items-center rounded-control bg-primary text-lead font-bold text-on-primary"
          >
            9
          </span>
          <span className={cn("min-w-0 truncate text-lead font-bold text-on-ink", HIDE_IN_RAIL)}>
            {brand}
          </span>
          <span
            className={cn(
              "ml-auto shrink-0 rounded-[5px] border border-on-ink/20 px-1.5 text-micro text-on-ink-muted",
              HIDE_IN_RAIL,
            )}
          >
            {roleLabel}
          </span>
        </div>
        <nav aria-label="เมนูผู้ดูแล" className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2.5">
          <Suspense fallback={<MenuLinks nav={nav} pathname={null} />}>
            <ActiveMenuLinks nav={nav} />
          </Suspense>
        </nav>
        <button
          type="button"
          onClick={toggle}
          aria-label={collapseLabel(open)}
          title={collapseLabel(open)}
          className={cn(
            "flex min-h-control shrink-0 items-center gap-2.5 border-t border-on-ink/10 px-5 text-small text-on-ink-muted hover:text-on-ink",
            CENTER_IN_RAIL,
            "group-data-[menu=closed]/shell:px-0 group-data-[menu=auto]/shell:max-lg:px-0",
          )}
        >
          <ChevronsLeft
            aria-hidden="true"
            strokeWidth={1.9}
            className={cn("size-icon shrink-0 transition-transform duration-200", FLIP_IN_RAIL)}
          />
          <span className={HIDE_IN_RAIL}>{collapseLabel(open)}</span>
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-line bg-surface px-3">
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-label="เปิดหรือปิดเมนู"
            title="เปิดหรือปิดเมนู"
            className="grid size-control place-items-center rounded-control text-fg-2 hover:bg-surface-muted"
          >
            <Menu aria-hidden="true" strokeWidth={1.9} className="size-icon" />
          </button>
          {centerSlot ? <div className="min-w-0">{centerSlot}</div> : null}
          <div className="ml-auto flex min-w-0 items-center gap-3">
            {helpHref ? (
              <Link
                href={helpHref}
                className="flex min-h-control items-center gap-1.5 rounded-control px-2.5 text-small font-bold text-fg-2 hover:bg-surface-muted"
              >
                <CircleHelp aria-hidden="true" strokeWidth={1.9} className="size-icon-sm" />
                ช่วยเหลือ
              </Link>
            ) : null}
            {user ? (
              <div className="flex min-w-0 items-center border-l border-line pl-3">{user}</div>
            ) : null}
          </div>
        </header>
        <main className="min-w-0 flex-1 p-6">{children}</main>
        <footer className="border-t border-line bg-surface px-6 py-2.5 text-micro text-fg-muted">
          {footer}
        </footer>
      </div>
    </div>
  );
}
