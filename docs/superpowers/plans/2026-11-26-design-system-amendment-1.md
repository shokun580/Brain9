# Design System Amendment 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to
> implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the admin side a two-level menu and a calmer page layout, and give both sides
loading skeletons and a 0.3 s fade when changing page.

**Architecture:** Tokens and motion CSS land first in one task that alone owns
`globals.css`. The menu, the page-layout components, row actions, skeleton primitives and
the transition wrappers are then built in parallel (different files), and two short
integration tasks wire them into the layouts and the reference screens. Transitions use
React `<ViewTransition>`: only navigations tagged with `transitionTypes` animate.

**Tech Stack:** Next.js 16.4 (Cache Components), React 19.3 `ViewTransition`, Tailwind CSS 4,
Vitest (node, static markup through `test/render.tsx`).

**Spec:** `docs/superpowers/specs/2026-11-26-design-system-amendment-1.md` (it amends
`2026-11-26-design-system-design.md`). Technical background with doc references:
`.superpowers/sdd/2026-11-26-design-system/prep-admin-v2-motion.md` (facts D1–D16, C1–C4).

## Global Constraints

- Everything in the Global Constraints of `2026-11-26-design-system.md` still binds, except
  that tasks marked ∥ may run at the same time in separate git worktrees.
- No new dependency.
- Menu: dark (`ink`), a word under every rail icon; the selected entry is a lighter rounded
  fill only — no accent bar, no coloured shadow; menu text is regular weight.
- Bold (700) on the admin side only for the page title, section headings, the main number
  of a stat card and buttons.
- Cards on the admin side are `StatTile` and `TableCard` only; no card around a form or a
  whole section; no shadows.
- Page / menu change: fade in, `300ms`, no movement. Skeleton: shimmer.
- Only navigations tagged with `transitionTypes` animate; every `ViewTransition` has
  `default="none"`. Nothing under a training route may use `Reveal`, `ViewTransition` or a
  typed link.
- Reduced motion: view transitions take `0s` and skeleton bars do not animate.
- A hidden menu panel is not reachable with Tab; every admin page is reachable without
  JavaScript.
- `src/app/globals.css` and `src/app/tokens.test.ts` (wherever it lives) are edited by
  Task 17 only. `src/shared/ui/index.ts`: each task adds lines only under its own comment
  block created by Task 17. `src/app/admin/layout.tsx` is edited by Tasks 19 and 24 only;
  `src/app/(elder)/layout.tsx` by Task 23 only.
- Fake data only; UI text Thai; commits `infra` scope with the session trailer.

## Review Focus

1. **A dynamic admin route whose pathname is not known at first render:** the menu still
   lists every section and page (no blank panel). → Task 19 test.
2. **Keyboard user with the panel hidden:** Tab never lands on an invisible link; the
   toggle reopens it and focus stays on the toggle. → Task 19 test + browser check.
3. **Reduced-motion user:** no fade, no shimmer, nothing restarts every frame. → Task 17
   tests on the CSS.
4. **Slow data:** the skeleton has the same rows / columns as the table that replaces it,
   so nothing below it jumps. → Task 22 and Task 25 tests (shared column list).
5. **Rapid clicking through the menu:** clicks during a fade still land. → Task 17 CSS test
   (`::view-transition { pointer-events: none }`) + browser check.

---

# PR A — Admin layout v2 (branch `feat/infra-ds-admin-v2`)

### Task 17: Tokens and motion foundation (first, alone)

**Files:** Modify `src/app/globals.css`, the token contract test, `src/shared/ui/index.ts`.
Create `src/shared/lib/motion.ts`, `src/shared/lib/motion.test.ts`.

**Interfaces — Produces:**

```ts
// src/shared/lib/motion.ts
export const NAV_TYPES = { section: "b9-section", page: "b9-page", tab: "b9-tab" } as const;
export const pageEnter: Record<string, string>; // { "b9-section": "b9-page-in", "b9-page": "b9-page-in", "b9-tab": "b9-page-in", default: "none" }
export const pageExit: Record<string, string>; // same keys → "b9-page-out", default "none"
export const panelEnter: Record<string, string>; // { "b9-section": "b9-panel-in", default: "none" }
export const revealEnter = "b9-content-in";
export const revealExit = "b9-skeleton-out";
```

Utilities / tokens (exact names): `--b9-motion-enter: 300ms`, `--b9-motion-exit: 100ms`,
`--b9-skeleton` (`#E3E9EC`; high-contrast elder `#3A3A3A`), `--b9-skeleton-shine`
(`#F6F9FA`; high contrast `#5A5A5A`), `bg-skeleton`, `animate-skeleton`
(`b9-skeleton-shimmer 1.5s linear infinite`), `max-w-admin` (`53.75rem`), custom variant
`noscript` (`@media (scripting: none)`), nav tokens `nav-rail` (`#0C161D`), `nav-fill`
(white at 10%), `nav-line` (white at 14%).

- [ ] **Step 1: Failing tests.** Token test: the values above exist; `--b9-motion-*` are on
      `:root`; the css contains `::view-transition { pointer-events: none }` (whitespace
      insensitive), rules for `::view-transition-new(.b9-page-in)`,
      `::view-transition-old(.b9-page-out)`, `.b9-panel-in`, `.b9-content-in`,
      `.b9-skeleton-out`, a `prefers-reduced-motion` block that sets
      `::view-transition-old(*), ::view-transition-new(*), ::view-transition-group(*)` to
      `animation-duration: 0s`, and the existing global reduced-motion rule also sets
      `animation-iteration-count: 1`; `on-ink-2` / `on-ink-muted` on `nav-rail` are ≥ 4.5.
      `motion.test.ts`: every class name in `motion.ts` appears in `globals.css`.
- [ ] **Step 2:** Run (FAIL). **Step 3:** Implement. `b9-page-in` = opacity 0 → 1 over
      `--b9-motion-enter`; `b9-page-out` = opacity 1 → 0 over `--b9-motion-exit`; the new
      snapshot's fade starts after the exit. Anchored chrome: names `admin-nav`,
      `admin-topbar`, `elder-tabbar` get `animation: none` and their old snapshot
      `display: none`. Add the four comment blocks to `index.ts`:
      `// admin shell (Task 19)`, `// admin layout (Tasks 20, 21)`, `// skeleton (Task 22)`,
      `// motion (Task 23)`.
- [ ] **Step 4:** `pnpm check && pnpm build` (PASS). **Step 5: Commit**
      `feat(infra): add motion, skeleton and admin navigation tokens`

### Task 18: Navigation model ∥

**Files:** Create `src/shared/ui/admin-nav.ts`, `src/shared/ui/admin-nav.test.ts`.

```ts
export type AdminNavItem = { href: string; label: string; icon: ReactNode; badge?: ReactNode };
export type AdminNavGroup = { label?: string; items: AdminNavItem[] };
export type AdminNavSection = {
  id: string;
  label: string;
  railLabel: string;
  icon: ReactNode;
  groups: AdminNavGroup[];
};
export function sectionHref(section: AdminNavSection): string; // first item of the first non-empty group
export function findActiveNav(
  sections: AdminNavSection[],
  pathname: string | null,
): { sectionId: string; href: string } | null; // longest isActivePath match
```

- [ ] **Step 1: Failing tests:** `/admin/content/courses/abc` → courses item in `content`;
      `/admin` exact only; a trailing slash matches; `null`, `""` and an unknown path →
      `null`; with items `/admin/content` and `/admin/content/courses` the longer wins;
      `sectionHref` skips an empty first group.
- [ ] **Step 2–4:** FAIL → implement (uses `isActivePath`) → PASS. **Step 5: Commit**
      `feat(infra): add the two-level admin navigation model`

### Task 19: Two-level admin shell (after Task 18)

**Files:** Rewrite `src/shared/ui/AdminShell.tsx`, `AdminShell.test.tsx`; modify
`src/app/admin/nav.tsx`, `nav.test.tsx`, `src/app/admin/layout.tsx` (props only),
`src/shared/ui/index.ts` (own block).

```ts
type AdminShellProps = {
  brand: string;
  roleLabel: string;
  nav: AdminNavSection[];
  user?: ReactNode;
  centerSlot?: ReactNode;
  helpHref?: string;
  footer?: ReactNode;
  environmentLabel?: string;
  children: ReactNode;
};
export function AdminNavView(props: {
  sections: AdminNavSection[];
  pathname: string | null;
}): ReactNode; // pure, for tests
```

Decisions: rail = `<nav aria-label="หมวดเมนูผู้ดูแล">` on `bg-nav-rail`, 80px, brand mark,
one `Link` per section to `sectionHref` with `transitionTypes={[NAV_TYPES.section]}`, icon

- `railLabel` (`text-micro`, regular), full label as `title`; the active section has
  `bg-nav-fill` and `aria-current` (`"page"` when the pathname is that href, else `"true"`).
  Panel = `<nav id="admin-panel" aria-labelledby="admin-panel-title">` on `bg-ink`, 232px:
  the section label as a small `text-on-ink-muted` `<p id="admin-panel-title">`, groups
  divided by a `border-nav-line` rule (a group `label` is rendered `sr-only`), items = icon +
  label (`text-lead`, regular, `text-on-ink-2`), `min-h-control`, `rounded-control`,
  `transitionTypes={[NAV_TYPES.page]}`; the current page has `bg-nav-fill text-on-ink` and
  `aria-current="page"`; no shadow, no border accent; badge after the label, announced.
  Pathname unknown or no match → the panel lists all sections stacked. Panel state =
  `data-panel="auto|open|closed"` on the root; `auto` is open from 1024px and hidden below by
  CSS; hidden = `w-0 invisible`; `noscript:` forces it open. Toggle at the rail foot uses
  `collapseLabel`; the top-bar toggle has `aria-controls="admin-panel"` and `aria-expanded`.
  A skip link `ข้ามไปยังเนื้อหา` → `<main id="main">`. `<main>` is `bg-surface`, padded,
  with an inner `max-w-admin` wrapper. Footer: `footer ?? "Brain9 ระบบฝึกสมองผู้สูงอายุ"`
  plus `· {environmentLabel}` when given (the layout passes the `APP_ENV` label, read where
  env is already read; never a secret). `viewTransitionName`: `admin-nav` on the rail + panel
  wrapper, `admin-topbar` on the top bar; the panel list is wrapped in
  `<ViewTransition key={sectionId} enter={panelEnter} default="none">`. `adminNav` becomes
  `AdminNavSection[]`: `overview` ภาพรวม; `people` ผู้ใช้และศูนย์ / rail `ผู้ใช้` (groups ผู้ใช้:
  ผู้ใช้งาน, คำขอข้อมูลส่วนบุคคล · ศูนย์: ศูนย์และเครื่อง); `booking` การจอง (ตารางเวลา,
  รายการจอง); `content` เนื้อหาและผล / rail `เนื้อหา` (groups เนื้อหา: คอร์สและแบบฝึก · ผลการฝึก:
  วิเคราะห์ผล); a comment names the owning lane above each group.

* [ ] **Step 1: Failing tests** (static markup, inline fixture; `AdminNavView` with a fixed
      pathname): both `<nav>` labels; section links point at the first page; the active
      section and page carry `aria-current` and `bg-nav-fill`, and no class containing
      `shadow` or `font-bold` appears inside the two navs; with `pathname={null}` every
      section label and every page label is present; the root has `data-panel="auto"`; the
      panel has `invisible` in its closed classes and a `noscript:` class; the skip link and
      `id="main"` exist; no `<h1`; `environmentLabel="staging"` renders `staging`.
      `nav.test.tsx`: hrefs per section in order; ids unique; every `railLabel` ≤ 8 chars.
* [ ] **Step 2–3:** FAIL → implement. **Step 4:** `pnpm check && pnpm build`.
* [ ] **Step 5: Commit** `feat(infra): rebuild the admin shell with a two-level menu`

### Task 20: Admin page-layout components ∥

**Files:** Create `src/shared/ui/AdminSection.tsx`, `TableCard.tsx` (+ tests in
`AdminLayout.test.tsx`). Modify `DataTable.tsx`, `PageHeader.tsx`, `Admin.test.tsx`,
`PageFurniture.test.tsx`, `index.ts` (own block).

```ts
type AdminSectionProps = {
  title: string;
  count?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};
type TableCardProps = { toolbar?: ReactNode; footer?: ReactNode; children: ReactNode };
```

Decisions: `AdminSection` = `<section aria-labelledby>`; header row `flex-wrap` with an
`<h2>` (`text-heading font-bold`), the count in `text-fg-muted`, the action `shrink-0`;
`border-b-[length:var(--b9-border)] border-line-strong pb-2`; body `pt-4`; sections
`mt-8` apart (`first:mt-6`). No border, background or radius around the section.
`TableCard` = `rounded-panel border border-line bg-surface overflow-hidden`; toolbar row
(`flex flex-wrap gap-2 p-3 border-b border-line`) only when given; footer
(`px-4 py-2.5 border-t border-line`) only when given; no shadow class. `DataTable`: `Th`
and `Td primary` lose `font-bold` (`Td primary` = `text-fg`, other cells `text-fg-2`), body
rows get `hover:bg-surface-subtle`. `PageHeader`: the current breadcrumb item is regular
weight `text-fg`.

- [ ] **Step 1: Failing tests:** `AdminSection` renders one `<h2`, the count, no
      `rounded-panel`, no `bg-surface`; `TableCard` has `rounded-panel` and `border-line`,
      no `shadow`, renders toolbar / footer only when given; `Th` and `Td primary` markup
      has no `font-bold`; `Tr` in a body has `hover:bg-surface-subtle`.
- [ ] **Step 2–4:** FAIL → implement → PASS. **Step 5: Commit**
      `feat(infra): add flat admin sections and the table card`

### Task 21: Row actions ∥

**Files:** Create `src/shared/ui/RowActions.tsx` + test; `index.ts` (admin layout block).

```ts
type RowAction = { label: string; href: string };
type RowActionsProps = {
  primary: RowAction;
  more?: RowAction[];
  moreLabel?: string /* "เพิ่มเติม" */;
  rowLabel: string;
};
```

Decisions: the primary action is a text link (`text-primary-press underline`). `more` is a
button (`aria-label="{moreLabel}: {rowLabel}"`, icon `Ellipsis`) that opens a native
`popover` list of links (read MDN for the `popover` attribute and `popovertarget`; ids from
`useId`); the list is `rounded-control border border-line bg-surface`, no shadow, positioned
under the button; Escape and outside click close it natively. Without `more` no button
renders. Read-only navigation links only — destructive actions go through a page with
`ConfirmDialog`, never straight from this menu.

- [ ] **Step 1: Failing tests:** primary link href and text; with `more`, a button with
      `popovertarget` equal to the list's `id`, the `aria-label` containing the row label,
      one `<a` per item; two instances get different ids; without `more` no `<button`.
- [ ] **Step 2–4:** FAIL → implement → PASS. **Step 5: Commit**
      `feat(infra): add table row actions with a more menu`

### Task 24a: Reference screens on the new layout (after Tasks 19, 20, 21)

**Files:** Modify `src/app/admin/content/courses/page.tsx`,
`src/modules/content/ui/CourseList.tsx`, `CreateCourseForm.tsx`, `src/app/admin/page.tsx`;
delete `src/shared/ui/Panel.tsx` and its tests / export.

Decisions: courses page = `PageHeader`, `AdminSection title="คอร์สทั้งหมด"` containing a
`TableCard` with the table, `AdminSection title="สร้างคอร์สใหม่"` with the form (one column,
`max-w-[35rem]`, submit button on the left under the fields). `/admin` = `PageHeader` +
`AdminSection title="สรุปวันนี้"` with the `EmptyState` placeholder. No `Panel` left in `src`.

- [ ] **Step 1:** Make the changes. **Step 2:** `pnpm check && pnpm build`.
- [ ] **Step 3: Browser check** at 1440px and 900px: menu sections switch, the selected
      entries have the lighter fill only, the panel hides and returns by keyboard and its
      links are skipped by Tab when hidden, the course table sits in its card, creating a
      course and the blank-title error still work, no horizontal scroll, no console error.
- [ ] **Step 4: Commit** `refactor(content): move the reference screens to the admin layout v2`
- [ ] **Step 5:** Whole-branch review, push, open PR A `feat(infra): admin layout v2`.

---

# PR B — Skeletons and motion (branch `feat/infra-ds-motion`, stacked on PR A)

### Task 22: Skeleton primitives ∥ (needs only Task 17)

**Files:** Create `src/shared/ui/Skeleton.tsx`, `Skeleton.test.tsx`; `index.ts` (own block).

```ts
type SkeletonRegionProps = { label: string; children: ReactNode };
type SkeletonLineProps = {
  width?: "sm" | "md" | "lg" | "full";
  text?: "body" | "small" | "heading" | "title";
};
type SkeletonBlockProps = { shape: "icon" | "icon-tile" | "control" | "control-sm" };
type TableSkeletonProps = {
  label: string;
  columns: { label: string; numeric?: boolean }[];
  rows?: number /* 3 */;
  lines?: 1 | 2;
};
function ListRowSkeleton(props: { label: string; rows?: number }): ReactNode;
function StatTileSkeleton(props: { label: string; count?: number }): ReactNode;
function AdminPageSkeleton(): ReactNode; // page-header lines + one TableSkeleton
```

Decisions: `SkeletonRegion` = `<div role="status" aria-busy="true">` + `sr-only` label +
`<div aria-hidden="true">`. A line is an outer `block h-[1lh]` in that text size with an
inner `h-[0.7em] rounded-full bg-skeleton animate-skeleton motion-reduce:animate-none` bar.
`TableSkeleton` is built from `Table / THead / Th / TBody / Tr / Td` with the real header
labels. No skeleton contains a link, button, input or `tabindex`.

- [ ] **Step 1: Failing tests:** region roles and hidden label; `aria-hidden` body; a line
      has `bg-skeleton`, `animate-skeleton`, `motion-reduce:animate-none`; `TableSkeleton`
      renders the header labels, `rows` body rows and the same `Td` classes as a real cell;
      no `<a`, `<button`, `<input`, `tabindex` in any skeleton.
- [ ] **Step 2–4:** FAIL → implement → PASS. **Step 5: Commit**
      `feat(infra): add loading skeleton primitives`

### Task 23: Transitions ∥ (needs only Task 17)

**Files:** Create `src/shared/ui/Reveal.tsx` + test, `src/app/admin/template.tsx`,
`src/app/(elder)/template.tsx`, `src/app/templates.test.tsx`. Modify `TabBar.tsx`,
`TabBar.test.tsx`, `src/app/(elder)/layout.tsx`, `index.ts` (own block).

```ts
function Reveal(props: { fallback: ReactNode; children: ReactNode }): ReactNode; // Suspense + two ViewTransitions
function TabBarView(props: {
  items: TabBarItem[];
  pathname: string | null;
  hideOn?: string[];
}): ReactNode; // pure
```

Decisions: `Reveal` = `<Suspense fallback={<ViewTransition exit={revealExit} default="none">…}>`
around `<ViewTransition enter={revealEnter} default="none">`. Each template returns
`<ViewTransition enter={pageEnter} exit={pageExit} default="none">{children}</ViewTransition>`
as its outermost element. `TabBar` links get `transitionTypes={[NAV_TYPES.tab]}`, the bar
gets `viewTransitionName: "elder-tabbar"`, and the layout's Suspense fallback becomes
`<TabBarView pathname={null} …>` so the bar never pops in.

- [ ] **Step 1: Failing tests:** call `Reveal(...)` and each template as functions and
      inspect the returned element: outer type, `ViewTransition` children, `enter` / `exit`
      props equal to the `motion.ts` constants, `default === "none"`; `TabBarView` with a
      pathname marks the right tab and with `null` marks none; hidden on a `hideOn` path.
- [ ] **Step 2–3:** FAIL → implement. **Step 4:** `pnpm check && pnpm build`.
- [ ] **Step 5: Commit** `feat(infra): fade pages and loading reveals with view transitions`

### Task 24b: Wire skeletons and reveals in (after Tasks 22, 23 and PR A)

**Files:** Modify `src/app/admin/layout.tsx`, `src/app/admin/content/courses/page.tsx`,
`src/modules/content/ui/CourseList.tsx` (+ `CourseListSkeleton`, shared `courseColumns`),
`src/modules/content/ui/index.ts`.

Decisions: the admin gate's fallback is `AdminPageSkeleton`; the `user` slot's fallback is
two `SkeletonLine`s; the course list is `<Reveal fallback={<CourseListSkeleton />}>`;
`CourseList` and `CourseListSkeleton` render the same exported `courseColumns`.

- [ ] **Step 1: Failing test:** `CourseListSkeleton` shows every `courseColumns` label.
- [ ] **Step 2:** Implement. **Step 3:** `pnpm check && pnpm build`.
- [ ] **Step 4: Browser check** (Chrome; reduced motion on and off; 1440px and 360px): the
      menu and tab bar stay still while the page fades in; a hard reload shows the gate
      skeleton then the table skeleton then the table with no jump; with reduced motion
      nothing animates and the skeleton is still; clicks during a fade land; typing in the
      course form, leaving and returning keeps the draft; no console error.
- [ ] **Step 5: Commit** `feat(content): show skeletons while the course list loads`
- [ ] **Step 6:** Whole-branch review, push, open PR B
      `feat(infra): loading skeletons and page transitions`.

---

Afterwards: the original plan's Tasks 14 and 16 (reference page `/design`, docs and the
`AGENTS.md` UI section) run last and must cover this amendment; Task 15 is already built.
