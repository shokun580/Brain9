# Design system — amendment 1: admin layout v2, loading skeletons, motion

Date: 2026-11-26. Approved by the lead the same day (menu, cards, motion, skeleton, then the table style). Amends `2026-11-26-design-system-design.md` (sections 5.1, 5.4, 5.6,
6.1, 6.2, 7, 10, 12). Where this file and the original disagree, this file wins.
Prototype the lead reacted to: `.superpowers/brainstorm/…/content/nav2-round2.html`.

## Why

After seeing the admin kit on real screens the lead asked for four changes: a two-level
menu like a reference image; fewer cards on the admin side; a page skeleton while data
loads; and a soft transition when changing page or menu. Ease of use stays the first
goal: data flows one way and the eye reads top to bottom.

## Decisions by the lead

| Topic              | Decision                                                                                                                                                                                                                                                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin menu         | Two levels: a narrow rail of sections, then a panel listing the pages of the selected section. Dark (`ink`). A word under every rail icon.                                                                                                                                                                                 |
| Menu styling       | Like the second reference image: the selected item is a lighter rounded fill only. No accent bar, no coloured shadow. Regular weight text. Groups inside a panel are separated by a thin line.                                                                                                                             |
| Bold               | Used sparingly on the admin side.                                                                                                                                                                                                                                                                                          |
| Cards              | Reduced, not banned. Dashboard figures stay cards, and a table sits in a thin-bordered card (below). Forms and ordinary page sections are not wrapped in cards.                                                                                                                                                            |
| Tables             | "Option 1" of the three shown: a rounded container with a thin border and no shadow; filters in a bar at the top of the container; the header row on a very light tint with regular-weight labels; rows separated by hairlines, a light tint on hover; the row count and page links in a footer inside the same container. |
| Page / menu change | Fade in, about 0.3 s, no movement.                                                                                                                                                                                                                                                                                         |
| Skeleton           | Shimmer (a light band moving across grey bars).                                                                                                                                                                                                                                                                            |

## What changes

### Admin menu (replaces the Menu bullet of §6.2)

- **Rail** (level 1): brand mark, one entry per section (icon + short word), a control at
  the foot that hides or shows the panel. Clicking a section opens that section's first page.
- **Panel** (level 2): the section's name as a small muted label, then its pages (icon +
  name, optional count badge). The page you are on has the lighter fill and
  `aria-current="page"`.
- Sections today: ภาพรวม · ผู้ใช้และศูนย์ (ผู้ใช้งาน, คำขอข้อมูลส่วนบุคคล | ศูนย์และเครื่อง) ·
  การจอง (ตารางเวลา, รายการจอง) · เนื้อหาและผล (คอร์สและแบบฝึก | วิเคราะห์ผล).
- From 1024px the panel is open; below it starts hidden and the rail stays. A hidden panel
  is not reachable with Tab. Every page is reachable without JavaScript.
- The top bar stays: panel toggle, centre-selector slot, the signed-in admin's name and role.
- `src/app/admin/nav.tsx` holds sections → groups → items, one line per page, with a
  comment naming the owning lane, so four lanes can each add a line without conflicts.

### Admin page layout (replaces Content, Panels, Stat tiles, Editors of §6.2)

- The content area is white (`surface`), one column, at most 860px wide, left aligned.
  A page reads top to bottom: page header → filters → sections → save bar. No side column.
- **Section** (new `AdminSection`, replaces `Panel`): a heading with an optional count and
  action, a line under it, then the content. Sections sit 32px apart. No border, no
  background, no radius.
- **Tables** sit in a `TableCard`: `rounded-panel`, a `line` border, no shadow, the width of
  the column. Optional toolbar (filters) on top, the table, then an optional footer that holds
  `Pagination`. Header row on `surface-subtle` with regular-weight `fg-muted` labels; rows
  divided by hairlines with a `surface-subtle` hover. The section heading and the page's
  primary action stay outside the card, above it.
- **Forms** are one column, at most 560px wide, with the submit button under the fields on
  the left.
- **Cards** are for a self-contained figure, or one item in a grid of like items. On the
  admin side that is `StatTile` (kept: border, no shadow) and `TableCard`. A card never
  wraps a form or a whole section. Dialogs and toasts are overlays, not cards.
- **Bold (700)** is for the page title, section headings, the main number of a stat card
  and buttons. Menu entries, table headers, table cells, breadcrumbs and the user name are
  regular weight.

### Skeletons (new, both sides)

- While data loads, the page shows grey bars in the shape of what is coming: the page
  header and table headings appear at once, rows and figures are bars.
- Shared pieces in `src/shared/ui` (lines, blocks, a table skeleton, list-row and stat-card
  skeletons). A page's own skeleton lives in the module that owns the page, next to the
  real component, built from the same column list so the two cannot drift.
- Announced once to screen readers as "กำลังโหลด…"; contains nothing focusable; visible in
  high contrast; sized from the real text and controls, so content does not jump.
- Rule for every lane: a component that reads data is wrapped with a skeleton fallback, not
  a text line.

### Motion (extends §5.6)

- Changing page from the admin rail or panel, or from the elderly tab bar: the new page
  fades in over 0.3 s. The rail, panel, top bar and tab bar stay still.
- A skeleton fades into its content the same way.
- Changing section fades the panel's list the same way.
- No movement, no scaling, no bounce.
- Off when the device asks for reduced motion (the skeleton is then a still grey bar).
  Browsers without view-transition support change page instantly; nothing breaks.
- Only navigation animates. A training exercise never does: nothing inside it uses these
  transitions, so timing is unaffected.

## How (the lead left this to the builder)

React `<ViewTransition>` with Next.js 16.4, which needs no configuration: typed
navigations (`transitionTypes` on the menu and tab links) and Suspense reveals; every
wrapper is `default="none"`, so untagged navigations and the training route never animate.
No new dependency. Considered and dropped: a CSS animation on a remounting `template.tsx`
alone (cannot fade a skeleton into content or keep the menu still as cleanly), and an
animation library (a dependency for something the platform already does).

## Calls made by the designer (say if any is wrong)

1. "A delay of about 0.3 s" is built as a 0.3 s fade that starts at once. A real wait
   before anything happens would make the app feel slow.
2. No search box and no profile photo, although the reference image has both: there is
   nothing to search yet and the system stores no photos. The admin's name stays in the
   top bar.
3. Count badges in the menu appear only when a lane supplies a real number.
4. Whether the panel was hidden is not remembered after a reload.
5. Below 1024px an opened panel pushes the content rather than covering it.
6. The admin gate keeps wrapping every admin page (a generic page skeleton shows first).
7. Pages that truly need more width (charts, the Pattern Editor) may opt out of the 860px
   column; everything else keeps it.
8. On the elderly side only tab-bar navigation animates.
9. Form field labels stay bold: the field components are shared with the elderly side,
   where the bold label helps.
10. Table row actions (one text link plus a "more" menu) and a footer line with the
    environment name, both in the original spec but never built, are added in this work.
    Row selection and rows-per-page stay unbuilt until a lane needs them.

## Open with another lane

Engine: is the timed exercise at `/play` or under `/courses/<id>/play`? The tab bar hides
on `/play` only.

## Delivery

1. PR 3 as reviewed (tables, pagination, status, page header stay valid).
2. A small PR with the lint rule against raw colours.
3. Admin layout v2: menu, sections, tables, reference screens.
4. Skeletons and motion (the lead's "PR 5").
5. The reference page `/design`, the docs and the `AGENTS.md` UI section, last, so they
   describe the final system.

Independent parts are built in parallel in separate git worktrees; each still gets its own
review, and the whole branch is reviewed before each push.
