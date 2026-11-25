"use client";

import { ChevronsLeft, CircleHelp, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState, useSyncExternalStore, ViewTransition, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { NAV_TYPES, panelEnter } from "@/shared/lib/motion";
import { findActiveNav, sectionHref, type AdminNavSection } from "./admin-nav";

export type AdminShellProps = {
  brand: string;
  roleLabel: string;
  nav: AdminNavSection[];
  /** Name and role of the signed-in admin. Nothing else about the person belongs here. */
  user?: ReactNode;
  centerSlot?: ReactNode;
  footer?: ReactNode;
  /** The help link is rendered only when there is somewhere to go. */
  helpHref?: string;
  /** Short name of a non-production deployment (`local`, `staging`); never a secret. */
  environmentLabel?: string;
  children: ReactNode;
};

// The page list (the "panel") has three states on the root's `data-panel`: "open", "closed",
// and "auto" (nobody has pressed a toggle yet). "auto" is the server-rendered default: shown
// from 1024px up, hidden below it. It is decided by CSS, so there is no flash and no layout
// jump. Hidden means `w-0 invisible`: invisible takes the links out of the tab order. Without
// JavaScript (`noscript:`) the panel is forced open so every page stays reachable.
const PANEL_CLASSES = cn(
  "w-[232px] shrink-0 overflow-hidden bg-ink transition-[width] duration-200 ease-out",
  "group-data-[panel=closed]/shell:invisible group-data-[panel=closed]/shell:w-0",
  "group-data-[panel=auto]/shell:max-lg:invisible group-data-[panel=auto]/shell:max-lg:w-0",
  "noscript:visible! noscript:w-[232px]!",
);
const FLIP_WHEN_CLOSED =
  "group-data-[panel=closed]/shell:rotate-180 group-data-[panel=auto]/shell:max-lg:rotate-180";

/** Name of the rail-foot button: it collapses an open panel and expands a closed one. */
export function collapseLabel(open: boolean): string {
  return open ? "ย่อเมนู" : "ขยายเมนู";
}

const WIDE_QUERY = "(min-width: 1024px)";

function subscribeToWidth(onChange: () => void) {
  const query = window.matchMedia(WIDE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Whether the panel is shown by default at the current width (matches the CSS above). */
function useWide(): boolean {
  return useSyncExternalStore(
    subscribeToWidth,
    () => window.matchMedia(WIDE_QUERY).matches,
    // Below 1024px the server HTML says "open" until hydration corrects it (the cost of the
    // no-flash CSS default).
    () => true,
  );
}

function RailLink({
  section,
  active,
  current,
}: {
  section: AdminNavSection;
  active: boolean;
  current: "page" | "true" | undefined;
}) {
  return (
    <Link
      href={sectionHref(section)}
      title={section.label}
      transitionTypes={[NAV_TYPES.section]}
      aria-current={current}
      className={cn(
        "flex min-h-control w-full flex-col items-center justify-center gap-1 rounded-control px-1 py-2 text-center text-micro transition-colors duration-150 ease-out hover:bg-nav-fill hover:text-on-ink",
        active ? "bg-nav-fill text-on-ink" : "text-on-ink-2",
      )}
    >
      <span aria-hidden="true" className="grid size-icon shrink-0 place-items-center">
        {section.icon}
      </span>
      <span className="[overflow-wrap:anywhere]">{section.railLabel}</span>
    </Link>
  );
}

function PanelSection({
  section,
  activeHref,
  heading,
}: {
  section: AdminNavSection;
  activeHref: string | null;
  /** Stacked layout only: the section's own title above its pages. */
  heading: boolean;
}) {
  return (
    <div className="flex flex-col">
      {heading ? (
        <p className="px-3 pt-4 pb-1.5 text-small text-on-ink-muted">{section.label}</p>
      ) : null}
      {section.groups.map((group, index) => (
        <div
          key={group.label ?? `group-${index}`}
          className={cn(
            "flex flex-col gap-0.5",
            index > 0 && "mt-2 border-t-[length:var(--b9-border)] border-nav-line pt-2",
          )}
        >
          {group.label ? <p className="sr-only">{group.label}</p> : null}
          {group.items.map((item) => {
            const active = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                transitionTypes={[NAV_TYPES.page]}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-control items-center gap-3 rounded-control px-3 py-2 text-lead transition-colors duration-150 ease-out hover:bg-nav-fill hover:text-on-ink",
                  active ? "bg-nav-fill text-on-ink" : "text-on-ink-2",
                )}
              >
                <span aria-hidden="true" className="grid size-icon shrink-0 place-items-center">
                  {item.icon}
                </span>
                <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{item.label}</span>
                {item.badge ? (
                  <span className="rounded-full bg-attention-soft px-2 text-micro text-attention">
                    <span className="sr-only">ที่รอดำเนินการ </span>
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/**
 * The two menus: a rail of sections and, beside it, the pages of the selected section.
 * Pure (the pathname is a prop) so it renders in tests; the shell feeds it `usePathname()`.
 * With an unknown pathname the panel lists every section stacked, so no page is unreachable.
 */
export function AdminNavView({
  sections,
  pathname,
  railHead,
  railFoot,
}: {
  sections: AdminNavSection[];
  pathname: string | null;
  /** Brand mark above the section links. */
  railHead?: ReactNode;
  /** Panel toggle below the section links. */
  railFoot?: ReactNode;
}) {
  const found = findActiveNav(sections, pathname);
  const activeSection = found ? sections.find((s) => s.id === found.sectionId) : undefined;
  const activeHref = found?.href ?? null;

  return (
    <>
      <nav
        aria-label="หมวดเมนูผู้ดูแล"
        className="flex w-20 shrink-0 flex-col items-center gap-1 overflow-y-auto bg-nav-rail px-1.5 py-2"
      >
        {railHead}
        {sections.map((section) => {
          const active = section.id === activeSection?.id;
          const onItsPage = active && activeHref === sectionHref(section);
          return (
            <RailLink
              key={section.id}
              section={section}
              active={active}
              current={active ? (onItsPage ? "page" : "true") : undefined}
            />
          );
        })}
        <div className="mt-auto w-full">{railFoot}</div>
      </nav>
      <nav
        id="admin-panel"
        aria-labelledby="admin-panel-title"
        className={cn(PANEL_CLASSES, "border-r border-nav-line")}
      >
        <div className="h-full w-[232px] overflow-y-auto px-3 py-4">
          <p id="admin-panel-title" className="px-3 pb-2 text-small text-on-ink-muted">
            {activeSection ? activeSection.label : "เมนูทั้งหมด"}
          </p>
          <ViewTransition key={activeSection?.id ?? "all"} enter={panelEnter} default="none">
            <div className="flex flex-col">
              {activeSection ? (
                <PanelSection section={activeSection} activeHref={activeHref} heading={false} />
              ) : (
                sections.map((section) => (
                  <PanelSection key={section.id} section={section} activeHref={null} heading />
                ))
              )}
            </div>
          </ViewTransition>
        </div>
      </nav>
    </>
  );
}

/** Reads the path in its own client leaf so a suspending `usePathname` cannot blank the shell. */
function ActiveNav(props: {
  sections: AdminNavSection[];
  railHead: ReactNode;
  railFoot: ReactNode;
}) {
  // `null` outside a router: render the menu, mark nothing.
  const pathname = usePathname();
  return <AdminNavView {...props} pathname={pathname} />;
}

/**
 * Frame of every admin page: a dark rail of sections, a panel with the pages of the selected
 * section, a 56px top bar and the content. The page owns its own `<h1>` (PageHeader); the
 * shell never renders one.
 */
export function AdminShell({
  brand,
  roleLabel,
  nav,
  user,
  centerSlot,
  footer = "Brain9 ระบบฝึกสมองผู้สูงอายุ",
  helpHref,
  environmentLabel,
  children,
}: AdminShellProps) {
  // null until a toggle is pressed: then CSS decides (see above). After that the user decides.
  const [chosen, setChosen] = useState<boolean | null>(null);
  const wide = useWide();
  const open = chosen ?? wide;
  const toggle = () => setChosen(!open);

  const railHead = (
    <span
      aria-hidden="true"
      title={`${brand} ${roleLabel}`}
      className="mb-2 grid size-9 shrink-0 place-items-center rounded-control bg-primary text-lead text-on-primary"
    >
      9
    </span>
  );
  const railFoot = (
    <button
      type="button"
      onClick={toggle}
      aria-label={collapseLabel(open)}
      title={collapseLabel(open)}
      className="flex min-h-control w-full flex-col items-center justify-center gap-1 rounded-control px-1 py-2 text-micro text-on-ink-muted hover:bg-nav-fill hover:text-on-ink"
    >
      <ChevronsLeft
        aria-hidden="true"
        strokeWidth={1.9}
        className={cn("size-icon shrink-0 transition-transform duration-200", FLIP_WHEN_CLOSED)}
      />
      <span>{collapseLabel(open)}</span>
    </button>
  );

  return (
    <div
      data-ui="admin"
      data-panel={chosen === null ? "auto" : chosen ? "open" : "closed"}
      className="group/shell flex min-h-dvh bg-page text-fg"
    >
      <a
        href="#main"
        className="sr-only z-50 rounded-control bg-surface px-4 py-3 text-body text-fg focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        ข้ามไปยังเนื้อหา
      </a>

      <div
        style={{ viewTransitionName: "admin-nav" }}
        className="sticky top-0 flex h-dvh shrink-0 text-on-ink-2 [--b9-focus:var(--b9-primary-bright)]"
      >
        <Suspense
          fallback={
            <AdminNavView sections={nav} pathname={null} railHead={railHead} railFoot={railFoot} />
          }
        >
          <ActiveNav sections={nav} railHead={railHead} railFoot={railFoot} />
        </Suspense>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          style={{ viewTransitionName: "admin-topbar" }}
          className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-line bg-surface px-3"
        >
          <button
            type="button"
            onClick={toggle}
            aria-controls="admin-panel"
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
                className="flex min-h-control items-center gap-1.5 rounded-control px-2.5 text-small text-fg-2 hover:bg-surface-muted"
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
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 bg-surface p-6 outline-none">
          <div className="max-w-admin">{children}</div>
        </main>
        <footer className="border-t border-line bg-surface px-6 py-2.5 text-micro text-fg-muted">
          {footer}
          {environmentLabel ? ` · ${environmentLabel}` : null}
        </footer>
      </div>
    </div>
  );
}
