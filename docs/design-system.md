# Brain9 design system

Owner: infra (team lead). Read this before you build any screen. It is written for people
and for AI assistants: every rule is a closed list, and every recipe can be copied.

Specs behind it: [`docs/superpowers/specs/2026-11-26-design-system-design.md`](superpowers/specs/2026-11-26-design-system-design.md)
as amended by [`…-amendment-1.md`](superpowers/specs/2026-11-26-design-system-amendment-1.md).
The code is the truth: if this file and the code disagree, tell the lead.

## 1. The rule

The design is closed. A screen is built from the design system and nothing else.

1. Build only with components from `@/shared/ui` and the utilities listed in section 3. A
   passing lint is not approval: ESLint catches raw colours, not Tailwind's own classes.
2. Follow a page recipe from section 5. Do not invent a layout.
3. Never restyle a shared component. `className` on one is for layout only.
4. If something is missing, **stop and open an `infra` issue**. Write: the screen you are
   building, what is missing, and a sketch (a photo of paper is fine). Do not hand-roll it,
   and do not add a UI library.
5. Where to look: `/design` (local and staging) shows every component live in both
   scopes; this file; the approved mock-ups in
   [`docs/design-system/mockups/`](design-system/mockups/README.md).

## 2. Two scopes

A layout sets `data-ui` on its root. The scope decides sizes; components never check it.
A lane never sets `data-ui` itself.

| Scope   | Set by                           | Body text | Control height  | Minimum target | Min. text | `data-size` / `data-contrast` |
| ------- | -------------------------------- | --------- | --------------- | -------------- | --------- | ----------------------------- |
| `elder` | `(auth)` and `(elder)` layouts   | 20px      | 64px (sm: 48px) | 48px           | 17.5px    | apply (set on `<html>`)       |
| `admin` | `AdminShell` (`data-ui="admin"`) | 14.5px    | 36px (sm: 30px) | 30px           | 12.5px    | ignored                       |

Elder text scales by `data-size` 1 / 2 / 3 (x1.0, x1.2, x1.4); icons do not scale. High
contrast (`data-contrast="high"`) turns the page black, borders white and 2px thick, and
removes shadows. Never fix a size in px: use the type and size utilities below.

## 3. Tokens

Defined in `src/app/globals.css`. Style only with these utility families, nothing else:

- **Colour:** the token utilities in the colour table below (`bg-…`, `text-…`, `border-…`, and
  `fill-…` / `stroke-…` inside an SVG), plus `border-[length:var(--b9-border)]` (and its `-t`
  / `-b` forms) for a border that thickens in high contrast.
- **Type:** `text-title` `text-heading` `text-lead` `text-body` `text-small` `text-micro`, and
  `font-bold`.
- **Size:** `h-control` `min-h-control` `h-control-sm` `min-h-control-sm` `size-icon`
  `size-icon-sm`.
- **Radius:** `rounded-control` `rounded-field` `rounded-panel` `rounded-dialog`.
- **Shadow:** `shadow-cell` `shadow-cell-lit` `shadow-overlay`.
- **Layout (Tailwind's own):** flex and grid (`flex`, `flex-col`, `items-…`, `justify-…`,
  `grid`, `grid-cols-…`), `gap-…`, padding, margin, width and max-width, on Tailwind's spacing
  scale; `list-disc` for a list in a dialog; and the two fixed values this document writes
  out: `max-w-[35rem]` for an admin form and the `StatTile` grid class in section 5.
- **Charts, inside a chart's SVG only:** `fill-[var(--chart-1)]` … `fill-[var(--chart-4)]`
  and `stroke-[var(--chart-1)]` … `stroke-[var(--chart-4)]` (section 8). ESLint lets them
  through, like every value it does not reject; that does not approve them anywhere else.

ESLint rejects raw colours and arbitrary colour or font-size values (`#0B7A75`, `bg-[#fff]`,
`text-[19px]`). It does not catch Tailwind's own palette, type sizes, radii, shadows and
animations (`bg-red-500`, `text-white`, `text-2xl`, `rounded-xl`, `shadow-lg`,
`animate-bounce`): they are not part of the design either, and a passing lint is not
approval. The 3x3 board and the Pattern Editor grid (section 7) are the one place a fixed
size in px is allowed.

### Colours

| Utility                                   | What it is for                                                 | Text on it                                          |
| ----------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------- |
| `bg-page`                                 | the page behind everything                                     | `text-fg`                                           |
| `bg-surface`                              | the working surface, dialogs, tables                           | `text-fg`, `text-fg-2`                              |
| `bg-surface-subtle`                       | table header, hover tint                                       | `text-fg-muted`                                     |
| `bg-surface-muted`                        | pressed state, neutral pill, empty meter bar                   | `text-fg-2`                                         |
| `text-fg` / `text-fg-2` / `text-fg-muted` | main / secondary / quiet text                                  |                                                     |
| `border-line` / `border-line-strong`      | hairline dividers / control borders                            |                                                     |
| `bg-primary`                              | the one primary action, selected state                         | `text-on-primary`                                   |
| `bg-primary-soft`                         | selected row, soft highlight                                   | `text-primary-press` (never `text-primary`)         |
| `bg-primary-tint`, `bg-primary-bright`    | board "shown" cell, accents on dark                            |                                                     |
| `bg-success` / `bg-success-soft`          | correct (always with ✓ and a word)                             | `text-on-primary` / `text-success`                  |
| `bg-danger` / `bg-danger-soft`            | wrong, destructive (always with ✕ and a word)                  | `text-on-danger` / `text-danger`                    |
| `bg-attention` / `bg-attention-soft`      | needs a look, two-finger cue                                   | `text-attention` on the soft one                    |
| `bg-ink`                                  | the admin menu, selected segment, toast                        | `text-on-ink`, `text-on-ink-2`, `text-on-ink-muted` |
| `border-edge`                             | transparent; white in high contrast, so surfaces do not vanish |                                                     |
| `bg-skeleton`                             | loading bars (with `animate-skeleton`)                         |                                                     |

Pairing rules:

- Text on `bg-primary-soft` is `text-primary-press`; on `bg-danger` it is `text-on-danger`.
- A border that must thicken in high contrast: `border-[length:var(--b9-border)]`
  (`border-t-[length:var(--b9-border)]`, `border-b-…` for one side).
- A surface that would disappear on the black high-contrast page carries `border-edge`.
- Focus rings come from the global `:focus-visible` rule; do not remove them.

### Type, sizes, radii, shadows

| Group   | Utilities                                                                     | Notes                                                                              |
| ------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Type    | `text-title` `text-heading` `text-lead` `text-body` `text-small` `text-micro` | elder 35 / 27 / 22 / 20 / 17.5 / 17.5px, admin 22 / 17 / 15.5 / 14.5 / 13 / 12.5px |
| Weight  | regular and `font-bold` only                                                  | admin: bold only for the page title, section headings, a stat figure, buttons      |
| Control | `h-control` `min-h-control` `h-control-sm` `min-h-control-sm`                 | height of buttons and fields in the active scope                                   |
| Icon    | `size-icon` `size-icon-sm`                                                    | lucide icons: `strokeWidth={1.9}`, `aria-hidden` next to a label                   |
| Radius  | `rounded-control` `rounded-field` `rounded-panel` `rounded-dialog`            | elder 18 / 14 / 26 / 26px, admin 8 / 8 / 10 / 12px                                 |
| Shadow  | `shadow-cell` `shadow-cell-lit` `shadow-overlay`                              | cells of the board and overlays only; admin pages have no shadows                  |
| Width   | `max-w-admin`                                                                 | set by `AdminShell`; do not repeat it                                              |

### Chart colours

`--chart-1` (teal, same as primary), `--chart-2` (blue), `--chart-3` (amber), `--chart-4`
(purple). Read them as CSS variables (`var(--chart-1)`), never as hex. Never rely on
colour alone: label every series. How a chart is drawn: section 8.

## 4. Component catalogue

All imports are `import { … } from "@/shared/ui";`. "Scope" says where a component is
meant to be used; shared ones adapt to the scope they sit in.

### Forms

| Component          | Use it for                           | Scope | Key props                                                                                                        |
| ------------------ | ------------------------------------ | ----- | ---------------------------------------------------------------------------------------------------------------- |
| `Button`           | every button and button-looking link | both  | `variant` (`primary` `secondary` `quiet` `danger`), `size`, `fullWidth`, `iconOnly` (needs `aria-label`), `href` |
| `TextField`        | one-line text                        | both  | `label`, `name`, `hint`, `errors`, any `<input>` prop                                                            |
| `Textarea`         | multi-line text                      | both  | same as `TextField`                                                                                              |
| `NumberField`      | numbers, optional unit               | both  | `label`, `name`, `unit`, `hint`, `errors`                                                                        |
| `Select`           | choose one from a list               | both  | `label`, `name`, `options: {value,label}[]`                                                                      |
| `Checkbox`         | a yes / no                           | both  | `label`, `name`, `hint`, `errors`                                                                                |
| `ChoiceList`       | large single choice (2 to 6 options) | elder | `name`, `legend`, `options` (`title`, `description`, `badge`, `disabled`), `defaultValue`, `onValueChange`       |
| `SegmentedControl` | compact single choice (2–3 options)  | admin | `name`, `legend`, `defaultValue`, `options`, `onValueChange`                                                     |
| `PinPad`           | PIN entry                            | elder | `length` (4 or 6), `filled`, `onDigit`, `onDelete`, `disabled`                                                   |
| `DisplaySettings`  | text size and high-contrast dialog   | elder | `triggerLabel`; place it in `ElderHeader`'s `action`                                                             |

Field errors come from `ActionResult.fieldErrors`: pass `errors={fieldErrors?.title}`.
`ChoiceList` takes 2 to 6 options and `SegmentedControl` 2 or 3; a question with more than
6 answers needs an `infra` issue.

### Feedback

| Component       | Use it for                            | Scope | Key props                                                                                       |
| --------------- | ------------------------------------- | ----- | ----------------------------------------------------------------------------------------------- |
| `Notice`        | inline message in a page              | both  | `tone` (`primary` `success` `danger` `attention`), `title`                                      |
| `Toast`         | a success after an action             | both  | `message`, `tone` (`success` `danger`: not for errors that need action)                         |
| `ConfirmDialog` | anything irreversible                 | both  | `open`, `title`, `children` (what will happen), `confirmLabel`, `tone`, `onConfirm`, `onCancel` |
| `ResultBanner`  | outcome of an answer                  | elder | `tone` (`success` `danger`), `title`, `detail`, `headingLevel`                                  |
| `Badge`         | status pill on the elderly side       | elder | `tone` (`neutral` `primary` `success` `danger` `attention`)                                     |
| `EmptyState`    | a list or page with nothing in it     | both  | `title`, `description`, `action`, `headingLevel`                                                |
| `ComingSoon`    | placeholder for a route not built yet | both  | `title`, `owner`; replace the whole page when you build it                                      |
| `Meter`         | progress toward a target              | elder | `label`, `value`, `max`, `valueText` (visible words), `segments`                                |

### Elderly layout

| Component      | Use it for                                            | Scope | Key props                                            |
| -------------- | ----------------------------------------------------- | ----- | ---------------------------------------------------- |
| `ElderHeader`  | top of every elderly screen (its `h1`)                | elder | `title` or `greeting` + `name`, `backHref`, `action` |
| `StepProgress` | "ขั้นที่ X จาก Y"                                         | elder | `current`, `total`                                   |
| `Section`      | a block of a screen: space and a thin line            | elder | `eyebrow`, `title`, `action`, `first`                |
| `ListRow`      | a whole row that is a link                            | elder | `href`, `title`, `subtitle`, `icon`, `badge`         |
| `TabBar`       | bottom navigation (the `(elder)` layout only)         | elder | `items`, `hideOn`                                    |
| `TabBarView`   | the same bar without router hooks (Suspense fallback) | elder | `items`, `pathname`, `hideOn`                        |

### Admin layout

| Component                      | Use it for                                    | Scope | Key props                                                                |
| ------------------------------ | --------------------------------------------- | ----- | ------------------------------------------------------------------------ |
| `AdminShell`                   | the frame of `/admin` (the admin layout only) | admin | `brand`, `roleLabel`, `nav`, `user`, `environmentLabel`                  |
| `PageHeader`                   | top of every admin page (its `h1`)            | admin | `title`, `description`, `breadcrumbs`, `action` (the one primary action) |
| `AdminSection`                 | a flat block: heading, line, content          | admin | `title`, `count`, `description`, `action`                                |
| `SaveBar`                      | sticky bar at the foot of an editor           | admin | `dirty`, `children` (the buttons)                                        |
| `StatTile`                     | one figure                                    | admin | `icon`, `label`, `value`, `unit`, `delta: {text,tone}`                   |
| `Tabs`                         | link tabs inside a page                       | admin | `items: {href,label,count,active}[]`, `label`                            |
| `Tag`                          | a property of a row (a setting, a mode)       | admin | `tone` (`neutral` `attention` `primary`), `icon`                         |
| `StatusDot`                    | the status of a row: dot plus word            | admin | `tone` (`ok` `draft` `off` `danger`)                                     |
| `findActiveNav`, `sectionHref` | helpers of the menu (infra only)              | admin | not for pages                                                            |

`findActiveNav` and `sectionHref` are lower-case functions; the types `AdminNavSection`,
`AdminNavGroup`, `AdminNavItem` describe `src/app/admin/nav.tsx`.

### Tables

| Component            | Use it for                             | Scope | Key props                                                                |
| -------------------- | -------------------------------------- | ----- | ------------------------------------------------------------------------ |
| `TableCard`          | the one box around a table             | admin | `toolbar` (filters, `Tabs`, `SegmentedControl`), `footer` (`Pagination`) |
| `Table`              | the table (scrolls sideways when wide) | admin | `aria-label`                                                             |
| `THead` `TBody` `Tr` | table structure                        | admin | plain                                                                    |
| `Th`                 | header cell                            | admin | `numeric`, `sort` (`asc` `desc` `none`)                                  |
| `Td`                 | body cell                              | admin | `numeric`, `primary`, `muted`                                            |
| `Pagination`         | row count and page links               | admin | `page`, `pageSize`, `total`, `hrefFor`                                   |
| `RowActions`         | end-of-row control                     | admin | `primary: {label,href}`, `more`, `rowLabel`                              |

### Loading

| Component           | Use it for                                 | Scope | Key props                                           |
| ------------------- | ------------------------------------------ | ----- | --------------------------------------------------- |
| `Reveal`            | Suspense whose skeleton fades into content | both  | `fallback`, `children`                              |
| `SkeletonRegion`    | one loading area (announced once)          | both  | `label`                                             |
| `SkeletonLine`      | one line of text                           | both  | `width` (`sm` `md` `lg` `full`), `text`             |
| `SkeletonBlock`     | an icon, tile or button shape              | both  | `shape` (`icon` `icon-tile` `control` `control-sm`) |
| `TableSkeleton`     | a loading table                            | admin | `columns`, `rows`, `lines`, `label` or `bare`       |
| `ListRowSkeleton`   | loading `ListRow`s                         | elder | `rows`, `label` or `bare`                           |
| `StatTileSkeleton`  | loading `StatTile`s                        | admin | `count`, `label` or `bare`                          |
| `AdminPageSkeleton` | generic admin page (layout, detail page)   | admin | none                                                |

### Brand

| Component   | Use it for                 | Scope | Key props                   |
| ----------- | -------------------------- | ----- | --------------------------- |
| `BrandMark` | the logo, and nothing else | both  | `className` (size), `label` |

### Server and client components

A page and a module's data components are Server Components. These shared components are
client components (`"use client"`): `AdminShell`, `ConfirmDialog`, `DisplaySettings`,
`PinPad`, `TabBar` and `TabBarView`. A Server Component may render a client component, but
may not pass it a function (a Server Action is the one exception). `ChoiceList` and
`SegmentedControl` also take a function prop (`onValueChange`), so use that prop only inside
your own `"use client"` component; without it both work as plain native radios. Everything
else in the catalogue works in either kind. Anything that needs state, an `onClick` or a
Server Action call (a dialog's `open`, a toast) goes in a small `"use client"` component in
your lane's `ui/` (recipes in section 6).

### Notes on the easy-to-misuse ones

- **`className`** on a shared component is for layout only: width, margin, grid placement.
  The helper (`cn`) only joins strings and does not merge conflicting utilities, so a
  colour or size class you add fights the component instead of replacing it. Do not.
- **`Pagination`**: count first, then `pageRange(rawPage, pageSize, total)` from
  `@/shared/lib/pagination`, query with its result, and pass `r.page` to the component.
  Copy the pattern from the JSDoc in `src/shared/lib/pagination.ts` and `Pagination.tsx`.
- **`ChoiceList`**: a disabled option must explain itself in `description`
  ("ยังไม่เปิดให้ใช้งาน"), never just grey out.
- **`ConfirmDialog`** for anything irreversible. `children` states what will happen, as a
  short list. Cancel is first and focused; the confirm button names the action.
- **`RowActions`**: one text link plus a "more" menu of links. It needs a `rowLabel`
  (screen readers hear "เพิ่มเติม: <rowLabel>"). It never performs an action itself:
  destructive actions live on a page behind `ConfirmDialog`.
- **Skeletons**: one `SkeletonRegion` per loading area. Composites (`TableSkeleton`,
  `ListRowSkeleton`, `StatTileSkeleton`) take `bare` when placed inside one, and `label`
  when alone. Build your page's skeleton in your module from the same column list as the
  real component (see `CourseListSkeleton`).
- **`Reveal`** instead of a bare `Suspense` whenever the fallback is a skeleton, so the
  skeleton fades into the content. Never put `Reveal` under a training route.
- **`BrandMark`** is the only logo. `src/app/icon.svg` is the same drawing with literal
  colours, for the favicon. Do not redraw or recolour it.

## 5. Page recipes

The only approved layouts. All follow `AGENTS.md` section 4: the page is thin, and data is
read inside a component wrapped in `Reveal` / `Suspense`.

### Admin rules

- One left-aligned column; the shell sets the width (`max-w-admin`). No side column.
- Order: `PageHeader` → `Tabs` (a record with several views) → `AdminSection`s → `SaveBar`
  (an edit page only).
- Cards only for a figure (`StatTile`) or a table (`TableCard`). Never around a form or a
  whole section. No shadows.
- Forms are one column, at most `max-w-[35rem]`.
- A form that **creates** something has its submit button under the fields, on the left, and
  no `SaveBar`. A page that **edits existing data** ends with `SaveBar` inside the `<form>`;
  its save button is the form's single `type="submit"`. `dirty` is a boolean the form's
  client component owns: `false` until a field changes (set it in the form's `onChange`),
  back to `false` after a successful save.
- One primary action per page: in `PageHeader`'s `action`, the submit button of a create
  form, or the save button of a `SaveBar`.
- Status is `StatusDot` (a row's state) or `Tag` (a property). Bold only where section 3 says.

### Admin list page

The reference is `src/app/admin/content/courses/page.tsx` with
`src/modules/content/ui/{CourseList,CourseListSkeleton,course-columns}`. Placeholders such
as `<lane>`, `Thing` and `listThingsForAdmin` stand for your own module's names.

Without paging or filters the page holds `TableCard` around the list (as
`src/app/admin/content/courses/page.tsx` does). With paging or filters the list component
owns the `TableCard` (toolbar, table, footer with `Pagination`), because the page function
may not read data. Either way the skeleton brings its own `TableCard`.

```tsx
// src/app/admin/<area>/<thing>/page.tsx — thin: no data access here
import { ThingList, ThingListSkeleton } from "@/modules/<lane>/ui";
import { AdminSection, PageHeader, Reveal, TableCard } from "@/shared/ui";

export const metadata = { title: "รายการตัวอย่าง" };

export default function AdminThingsPage() {
  return (
    <>
      <PageHeader
        title="รายการตัวอย่าง"
        breadcrumbs={[{ label: "ศูนย์ตัวอย่าง" }, { label: "รายการตัวอย่าง" }]}
        description="ดูรายการทั้งหมด"
      />
      <AdminSection title="รายการทั้งหมด">
        <Reveal fallback={<ThingListSkeleton />}>
          <TableCard>
            <ThingList />
          </TableCard>
        </Reveal>
      </AdminSection>
    </>
  );
}
```

```tsx
// src/modules/<lane>/ui/thing-columns.ts — one list, used by the table and its skeleton
export const thingColumns: { label: string; numeric?: boolean }[] = [
  { label: "ชื่อ" },
  { label: "จำนวน", numeric: true },
  { label: "สถานะ" },
];
```

```tsx
// src/modules/<lane>/ui/ThingListSkeleton.tsx
import { TableCard, TableSkeleton } from "@/shared/ui";
import { thingColumns } from "./thing-columns";

export function ThingListSkeleton() {
  return (
    <TableCard>
      <TableSkeleton label="กำลังโหลดรายการ" columns={thingColumns} />
    </TableCard>
  );
}
```

```tsx
// src/modules/<lane>/ui/ThingList.tsx — async Server Component: authorize, then read
import { requireAdmin } from "@/modules/identity";
import { EmptyState, StatusDot, Table, TBody, Td, Th, THead, Tr } from "@/shared/ui";
import { listThingsForAdmin } from "../server/thing-queries"; // your own query
import { thingColumns } from "./thing-columns";

export async function ThingList() {
  await requireAdmin();
  const things = await listThingsForAdmin();

  if (things.length === 0) {
    return <EmptyState title="ยังไม่มีรายการ" description="เริ่มเพิ่มรายการแรกได้เลย" />;
  }

  return (
    <Table aria-label="รายการตัวอย่าง">
      <THead>
        <Tr>
          {thingColumns.map((column) => (
            <Th key={column.label} numeric={column.numeric}>
              {column.label}
            </Th>
          ))}
        </Tr>
      </THead>
      <TBody>
        {things.map((thing) => (
          <Tr key={thing.id}>
            <Td primary>{thing.name}</Td>
            <Td numeric>{thing.count}</Td>
            <Td>
              <StatusDot tone="ok">เปิดใช้งาน</StatusDot>
            </Td>
          </Tr>
        ))}
      </TBody>
    </Table>
  );
}
```

A row with actions ends with a cell holding `RowActions` (props `primary`, `more`,
`rowLabel`), and a matching column label in `thingColumns`:

```tsx
import { RowActions } from "@/shared/ui";

<Td>
  <RowActions
    primary={{ label: "แก้ไข", href: `/admin/things/${thing.id}` }}
    rowLabel={thing.name}
  />
</Td>;
```

**With paging or filters**, the list component owns the `TableCard`: only it knows the
total. The page has no `TableCard`. `TableCard`'s `toolbar` prop takes filters (a `Select`,
a `TextField` in a GET form, a `SegmentedControl` or `Tabs`); its `footer` prop takes
`Pagination`.

```tsx
// page: pass the searchParams promise down; read it inside Reveal, never in the page
import { ThingPagedList, ThingListSkeleton } from "@/modules/<lane>/ui";
import { AdminSection, PageHeader, Reveal } from "@/shared/ui";

export default function AdminThingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <>
      <PageHeader title="รายการตัวอย่าง" />
      <AdminSection title="รายการทั้งหมด">
        <Reveal fallback={<ThingListSkeleton />}>
          <ThingPagedList searchParams={searchParams} />
        </Reveal>
      </AdminSection>
    </>
  );
}
```

```tsx
// src/modules/<lane>/ui/ThingPagedList.tsx — count first, then pageRange, query with its result
import { requireAdmin } from "@/modules/identity";
import { pageRange } from "@/shared/lib/pagination";
import {
  EmptyState,
  Pagination,
  StatusDot,
  Table,
  TableCard,
  TBody,
  Td,
  Th,
  THead,
  Tr,
} from "@/shared/ui";
import { countThings, listThingsPage } from "../server/thing-queries"; // your own queries
import { thingColumns } from "./thing-columns";

const PAGE_SIZE = 20;

export async function ThingPagedList({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const { page } = await searchParams;
  const total = await countThings();
  const r = pageRange(Number(page), PAGE_SIZE, total);
  const things = await listThingsPage({ skip: r.from === 0 ? 0 : r.from - 1, take: PAGE_SIZE });

  if (total === 0) {
    return <EmptyState title="ยังไม่มีรายการ" description="เริ่มเพิ่มรายการแรกได้เลย" />;
  }

  return (
    <TableCard
      footer={
        <Pagination
          page={r.page}
          pageSize={PAGE_SIZE}
          total={total}
          hrefFor={(n) => `?page=${n}`}
        />
      }
    >
      <Table aria-label="รายการตัวอย่าง">
        <THead>
          <Tr>
            {thingColumns.map((column) => (
              <Th key={column.label} numeric={column.numeric}>
                {column.label}
              </Th>
            ))}
          </Tr>
        </THead>
        <TBody>
          {things.map((thing) => (
            <Tr key={thing.id}>
              <Td primary>{thing.name}</Td>
              <Td numeric>{thing.count}</Td>
              <Td>
                <StatusDot tone="ok">เปิดใช้งาน</StatusDot>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </TableCard>
  );
}
```

### Admin form page

One column, no card, the form in a client component of your module. Two shapes, by what
the form does (the rule is in "Admin rules" above).

**A form that creates something:** the submit button under the fields, on the left, and no
`SaveBar` (copy `src/modules/content/ui/CreateCourseForm.tsx`).

```tsx
// page: thin
import { ThingForm } from "@/modules/<lane>/ui";
import { AdminSection, PageHeader } from "@/shared/ui";

export default function NewThingPage() {
  return (
    <>
      <PageHeader
        title="เพิ่มรายการตัวอย่าง"
        breadcrumbs={[{ label: "รายการตัวอย่าง", href: "/admin/things" }, { label: "เพิ่มรายการ" }]}
      />
      <AdminSection title="ข้อมูลทั่วไป">
        <ThingForm />
      </AdminSection>
    </>
  );
}
```

```tsx
// src/modules/<lane>/ui/ThingForm.tsx
"use client";

import { useActionState } from "react";
import { Button, Notice, TextField } from "@/shared/ui";
import { createThingAction, type CreateThingState } from "../server/thing-actions"; // your own action

export function ThingForm() {
  const [state, formAction, pending] = useActionState<CreateThingState, FormData>(
    createThingAction,
    null,
  );
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex max-w-[35rem] flex-col gap-5">
      <TextField label="ชื่อรายการ" name="name" required maxLength={200} errors={fieldErrors?.name} />
      {state && !state.ok && !state.fieldErrors ? (
        <Notice tone="danger">{state.message}</Notice>
      ) : null}
      {state?.ok ? <Notice tone="success">บันทึกเรียบร้อยแล้ว</Notice> : null}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "กำลังบันทึก…" : "บันทึก"}
        </Button>
      </div>
    </form>
  );
}
```

**A page that edits existing data:** the form wraps its `AdminSection`s and ends with
`SaveBar`, inside the `<form>`. The bar's buttons are a secondary "ยกเลิก" link back and the
one primary "บันทึก", the form's single `type="submit"`; there is no button under the
fields. The page reads the record inside `Reveal`, so a small loader component hands it to
the client form.

```tsx
// src/app/admin/<area>/<thing>/[id]/edit/page.tsx — thin: params go down, read inside Reveal
import { EditThing } from "@/modules/<lane>/ui";
import { PageHeader, Reveal, SkeletonBlock, SkeletonLine, SkeletonRegion } from "@/shared/ui";

export default function EditThingPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <PageHeader
        title="แก้ไขรายการ"
        breadcrumbs={[{ label: "รายการตัวอย่าง", href: "/admin/things" }, { label: "แก้ไขรายการ" }]}
      />
      <Reveal
        fallback={
          <SkeletonRegion label="กำลังโหลดข้อมูล">
            <div className="mt-6 flex max-w-[35rem] flex-col gap-3">
              <SkeletonLine text="heading" width="md" />
              <SkeletonBlock shape="control" />
            </div>
          </SkeletonRegion>
        }
      >
        <EditThing params={params} />
      </Reveal>
    </>
  );
}
```

```tsx
// src/modules/<lane>/ui/EditThing.tsx — async Server Component: authorize, read, hand over
import { notFound } from "next/navigation";
import { requireAdmin } from "@/modules/identity";
import { getThingForAdmin } from "../server/thing-queries"; // your own query
import { ThingEditor } from "./ThingEditor";

export async function EditThing({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const thing = await getThingForAdmin(id);
  if (!thing) notFound();
  return <ThingEditor thing={{ id: thing.id, name: thing.name, level: String(thing.level) }} />;
}
```

```tsx
// src/modules/<lane>/ui/ThingEditor.tsx — the form owns `dirty`
"use client";

import { useActionState, useState } from "react";
import { AdminSection, Button, Notice, SaveBar, Select, TextField, Toast } from "@/shared/ui";
import { updateThingAction, type UpdateThingState } from "../server/thing-actions"; // your own action

export function ThingEditor({ thing }: { thing: { id: string; name: string; level: string } }) {
  const [dirty, setDirty] = useState(false);
  const [state, formAction, pending] = useActionState<UpdateThingState, FormData>(
    async (previous, formData) => {
      const result = await updateThingAction(previous, formData);
      if (result?.ok) setDirty(false); // saved: nothing is unsaved any more
      return result;
    },
    null,
  );
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} onChange={() => setDirty(true)}>
      {/* the action authorizes and validates the id like any other input */}
      <input type="hidden" name="id" value={thing.id} />
      <AdminSection title="ข้อมูลทั่วไป">
        <div className="flex max-w-[35rem] flex-col gap-5">
          <TextField
            label="ชื่อรายการ"
            name="name"
            defaultValue={thing.name}
            required
            maxLength={200}
            errors={fieldErrors?.name}
          />
        </div>
      </AdminSection>
      <AdminSection title="การตั้งค่า">
        <div className="flex max-w-[35rem] flex-col gap-5">
          <Select
            label="ระดับ"
            name="level"
            defaultValue={thing.level}
            options={[
              { value: "1", label: "ระดับ 1" },
              { value: "2", label: "ระดับ 2" },
            ]}
            errors={fieldErrors?.level}
          />
        </div>
      </AdminSection>
      <div className="mt-6 flex flex-col items-start gap-3">
        {state && !state.ok && !state.fieldErrors ? (
          <Notice tone="danger">{state.message}</Notice>
        ) : null}
        {state?.ok && !dirty ? <Toast message="บันทึกเรียบร้อยแล้ว" /> : null}
      </div>
      <SaveBar dirty={dirty}>
        <Button variant="secondary" href="/admin/things">
          ยกเลิก
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "กำลังบันทึก…" : "บันทึก"}
        </Button>
      </SaveBar>
    </form>
  );
}
```

### Admin detail page

One record: `PageHeader` with breadcrumbs and one primary action, then `Tabs` when the
record has several views (each tab is its own route, so a view survives a reload; leave
`Tabs` out when there is one view), then `AdminSection`s with the record's fields, then a
last section for the destructive action: a danger `Button` that opens `ConfirmDialog`,
exactly the "Confirm an irreversible action" recipe in section 6. The header names the
record, so the component that reads it renders the header too; the page holds only
`Reveal`. Fields are a `<dl>` with exactly the classes below.

```tsx
// src/app/admin/<area>/<thing>/[id]/page.tsx — thin: params go down, read inside Reveal
import { ThingDetail } from "@/modules/<lane>/ui";
import { AdminPageSkeleton, Reveal } from "@/shared/ui";

export default function AdminThingPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Reveal fallback={<AdminPageSkeleton />}>
      <ThingDetail params={params} />
    </Reveal>
  );
}
```

```tsx
// src/modules/<lane>/ui/ThingHeader.tsx — the same header on every tab of the record
import { Button, PageHeader, Tabs } from "@/shared/ui";

export function ThingHeader({
  thing,
  tab,
}: {
  thing: { id: string; name: string };
  tab: "info" | "history";
}) {
  const base = `/admin/things/${thing.id}`;
  return (
    <>
      <PageHeader
        title={thing.name}
        breadcrumbs={[{ label: "รายการตัวอย่าง", href: "/admin/things" }, { label: thing.name }]}
        action={<Button href={`${base}/edit`}>แก้ไข</Button>}
      />
      <div className="mt-4">
        <Tabs
          label="มุมมองของรายการ"
          items={[
            { href: base, label: "ข้อมูล", active: tab === "info" },
            { href: `${base}/history`, label: "ประวัติ", active: tab === "history" },
          ]}
        />
      </div>
    </>
  );
}
```

```tsx
// src/modules/<lane>/ui/ThingDetail.tsx — async Server Component: authorize, then read
import { notFound } from "next/navigation";
import { requireAdmin } from "@/modules/identity";
import { AdminSection, StatusDot } from "@/shared/ui";
import { getThingForAdmin } from "../server/thing-queries"; // your own query (audits a read of a person's data)
import { ArchiveThingButton } from "./ArchiveThingButton"; // section 6, "Confirm an irreversible action"
import { ThingHeader } from "./ThingHeader";

export async function ThingDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const thing = await getThingForAdmin(id);
  if (!thing) notFound();

  return (
    <>
      <ThingHeader thing={thing} tab="info" />
      <AdminSection title="ข้อมูลทั่วไป">
        <dl className="flex flex-col gap-4">
          <div>
            <dt className="text-small text-fg-muted">ชื่อ</dt>
            <dd className="text-body text-fg">{thing.name}</dd>
          </div>
          <div>
            <dt className="text-small text-fg-muted">สถานะ</dt>
            <dd>
              <StatusDot tone="ok">เปิดใช้งาน</StatusDot>
            </dd>
          </div>
        </dl>
      </AdminSection>
      <AdminSection title="เก็บเข้าคลัง" description="รายการจะไม่แสดงในรายการหลัก ผู้ดูแลระบบขอคืนได้">
        <ArchiveThingButton thingId={thing.id} thingName={thing.name} />
      </AdminSection>
    </>
  );
}
```

The history tab is `[id]/history/page.tsx` with its own component that renders
`<ThingHeader thing={thing} tab="history" />` and its own sections.

### Admin overview with figures

```tsx
// page: thin
import { OverviewStats } from "@/modules/<lane>/ui";
import { AdminSection, PageHeader, Reveal, StatTileSkeleton } from "@/shared/ui";

export default function AdminOverviewPage() {
  return (
    <>
      <PageHeader title="ภาพรวม" description="สรุปของวันนี้" />
      <AdminSection title="สรุปวันนี้">
        <Reveal fallback={<StatTileSkeleton label="กำลังโหลดตัวเลขสรุป" count={1} />}>
          <OverviewStats />
        </Reveal>
      </AdminSection>
    </>
  );
}
```

```tsx
// src/modules/<lane>/ui/OverviewStats.tsx — async Server Component: authorize, read, render
import { Users } from "lucide-react";
import { requireAdmin } from "@/modules/identity";
import { StatTile } from "@/shared/ui";
import { countActiveToday } from "../server/overview-queries"; // your own query

export async function OverviewStats() {
  await requireAdmin();
  const active = await countActiveToday();

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3">
      <StatTile
        icon={<Users aria-hidden="true" strokeWidth={1.9} className="size-icon" />}
        label="ผู้ใช้ที่ฝึกวันนี้"
        value={String(active)}
        unit="คน"
        delta={{ text: "เพิ่มขึ้น 2 คนจากเมื่อวาน", tone: "up" }}
      />
    </div>
  );
}
```

Match the skeleton's `count` to the number of tiles.

### Admin page while loading

Not a page of its own: what every recipe above shows while its data component reads. The
`PageHeader` and the section headings appear at once; the `Reveal` fallback draws the shape
of what is coming (`ThingListSkeleton` in its own `TableCard`, `StatTileSkeleton`,
`AdminPageSkeleton`), built from the same column list as the real component, so nothing
jumps when the data arrives. Never a line of text such as "กำลังโหลด…".

### Elderly step screen

`ElderHeader`, then a `<form>` of three `Section`s: `StepProgress` ("ขั้นที่ X จาก Y"), one
question, and one primary `Button type="submit" fullWidth`. No cards, no second primary.

```tsx
// page: thin
import { ExampleStep } from "@/modules/<lane>/ui";
import { ElderHeader, Reveal, SkeletonLine, SkeletonRegion } from "@/shared/ui";

export default function Page() {
  return (
    <>
      <ElderHeader title="เลือกแบบฝึก" backHref="/home" />
      <Reveal
        fallback={
          <SkeletonRegion label="กำลังโหลด">
            <SkeletonLine width="lg" text="title" />
          </SkeletonRegion>
        }
      >
        <ExampleStep />
      </Reveal>
    </>
  );
}
```

```tsx
// src/modules/<lane>/ui/ExampleStep.tsx (an async Server Component when it reads data)
import { Button, ChoiceList, Section, StepProgress } from "@/shared/ui";

export function ExampleStep() {
  return (
    <form action="/courses">
      <Section first>
        <StepProgress current={1} total={3} />
      </Section>
      <Section>
        <ChoiceList
          name="mode"
          legend="วันนี้อยากฝึกแบบไหน"
          defaultValue="training"
          options={[
            { value: "training", title: "ฝึกเบา ๆ", description: "มีคำใบ้ ลองได้ไม่จำกัด" },
            { value: "test", title: "ทดสอบ", description: "ไม่มีคำใบ้ มีจำนวนครั้งจำกัด" },
          ]}
        />
      </Section>
      <Section>
        <Button type="submit" fullWidth>
          ไปต่อ
        </Button>
      </Section>
    </form>
  );
}
```

### Elderly list screen

Copy `src/app/(elder)/home/page.tsx`: `ElderHeader`, then `Section first` (with a title), then
`Section`s of `ListRow`s. A row is one link with an icon (labelled by its title), optional
`subtitle` and `badge`. A list that reads data wraps in `Reveal` with `ListRowSkeleton`.

```tsx
// page: thin
import { MyExerciseRows } from "@/modules/<lane>/ui";
import { ElderHeader, ListRowSkeleton, Reveal, Section } from "@/shared/ui";

export default function Page() {
  return (
    <>
      <ElderHeader title="แบบฝึกของฉัน" />
      <Section first title="แบบฝึกทั้งหมด">
        <Reveal fallback={<ListRowSkeleton label="กำลังโหลดรายการ" />}>
          <MyExerciseRows />
        </Reveal>
      </Section>
    </>
  );
}
```

```tsx
// src/modules/<lane>/ui/MyExerciseRows.tsx — async Server Component
import { Play } from "lucide-react";
import { ListRow } from "@/shared/ui";
import { listMyExercises } from "../server/exercise-queries"; // your own query (authorizes inside)

export async function MyExerciseRows() {
  const exercises = await listMyExercises();
  return (
    <>
      {exercises.map((exercise) => (
        <ListRow
          key={exercise.id}
          href={`/courses/${exercise.id}`}
          icon={
            <Play aria-hidden="true" strokeWidth={1.9} className="size-icon text-primary-press" />
          }
          title={exercise.title}
          subtitle="ประมาณ 5 นาที"
        />
      ))}
    </>
  );
}
```

### Elderly play and result screens

The engine lane's main screens (spec §6.1 and §8). A training route: data is read inside
`Suspense`, never `Reveal`, and nothing on the screen animates.

- **Play:** `ElderHeader`, then the board in a `Section first`. The board is the engine
  lane's `PatternGrid` from `@/modules/engine/ui`, built from section 7; its two-finger cue
  is a `Notice tone="attention"` above it. No other button competes with the board.
- `PatternGrid` is the engine lane's component: in these samples it is a placeholder until
  that lane delivers it, with whatever props that lane defines.
- **Result:** `ElderHeader`, then `ResultBanner` (✓ or ✕ and words, `headingLevel={2}`), the
  board in its final states, `Meter` if a score is shown, and one primary `Button`.

```tsx
// src/app/(elder)/play/page.tsx — thin; a training route: Suspense, never Reveal
import { Suspense } from "react";
import { PatternGrid } from "@/modules/engine/ui"; // the engine lane's board (section 7)
import { ElderHeader, Section, SkeletonLine, SkeletonRegion } from "@/shared/ui";

export default function PlayPage() {
  return (
    <>
      <ElderHeader title="ฝึกจำลำดับ" />
      <Section first>
        <Suspense
          fallback={
            <SkeletonRegion label="กำลังเตรียมแบบฝึก">
              <SkeletonLine width="lg" text="title" />
            </SkeletonRegion>
          }
        >
          <PatternGrid />
        </Suspense>
      </Section>
    </>
  );
}
```

```tsx
// src/modules/engine/ui/ExerciseResult.tsx — async Server Component, rendered in Suspense
import { Button, Meter, ResultBanner, Section } from "@/shared/ui";
import { getLatestResult } from "../server/result-queries"; // the engine lane's own query (authorizes inside)
import { PatternGrid } from "./PatternGrid"; // the engine lane's board, here in its final states

export async function ExerciseResult() {
  const result = await getLatestResult();
  return (
    <>
      <Section first>
        <ResultBanner
          tone={result.passed ? "success" : "danger"}
          headingLevel={2}
          title={result.passed ? "ถูกต้อง เก่งมากเลย" : "ไม่เป็นไรนะ ลองอีกครั้ง"}
          detail={`ถูก ${result.correct} จาก ${result.total} ข้อ`}
        />
      </Section>
      <Section>
        <PatternGrid />
      </Section>
      <Section>
        <Meter
          label="คะแนนรอบนี้"
          value={result.correct}
          max={result.total}
          segments
          valueText={`ถูก ${result.correct} จาก ${result.total} ข้อ`}
        />
      </Section>
      <Section>
        <Button href={result.nextHref} fullWidth>
          {result.passed ? "ทำข้อถัดไป" : "ลองอีกครั้ง"}
        </Button>
      </Section>
    </>
  );
}
```

The result page is the play page's shape with `ElderHeader title="ผลการฝึก"` and
`<ExerciseResult />` in the same `Suspense`.

### System screens

The 404 and error screens are shared files, not a lane's page: `src/app/not-found.tsx`,
`src/app/error.tsx`, `src/app/global-error.tsx`, built on `src/app/_system/SystemScreen.tsx`.
Top to bottom, centred, in the elderly scope for every visitor: `BrandMark`, the title as
the `h1`, one sentence, one primary `Button` (a quieter second one is allowed), the fixed
help line, and an optional muted reference line. No card, no illustration, no code number,
no animation. A page the visitor may not open calls `notFound()` and shows this same screen.

```tsx
// A page the visitor may not open answers like a page that does not exist.
if (!allowed) notFound();
```

## 6. How to…

**Add an admin menu entry.** One line in `src/app/admin/nav.tsx` under your own section
and group (a comment names the owning lane), plus its href in `src/app/admin/nav.test.tsx`.
Send it as a one-line PR; the lead approves.

**Add a page under an existing section.** Create `src/app/admin/<area>/<page>/page.tsx`
from a recipe. The page fades on navigation only if its section has its own `template.tsx`:
`src/app/admin/template.tsx` explains in its comment how a section adds one (the same
`ViewTransition`). Ask infra; do not write one yourself.

**Show a loading state.** Wrap the component that reads data in `Reveal` with a skeleton
(`TableSkeleton`, `ListRowSkeleton`, `StatTileSkeleton`, or `SkeletonLine` in a
`SkeletonRegion`). Never a line of text.

**Show an empty state.** `EmptyState` with a title that says what is missing and a
description that says what to do next ("ยังไม่มีคอร์ส", "เริ่มสร้างคอร์สแรกได้เลย"). An
`action` is a `Button`. No illustration.

**Show an error.** An error is shown where it happened: `errors` on the field it belongs to
(the `Field` error text), or a `Notice tone="danger"` next to the form or the button that
failed. A failed read: `Notice tone="danger"` with a calm next step
("ลองโหลดหน้านี้อีกครั้งนะ"). `Toast` is for a success or neutral confirmation only, never
the only place an error appears. Never show a stack trace, a code or a secret.

**Show a system screen (not found, error).** These are shared and a lane adds none:
`src/app/not-found.tsx`, `src/app/error.tsx` and `src/app/global-error.tsx`, all built on
`src/app/_system/SystemScreen.tsx` (plain text, elderly scope, one look for every visitor).
A page the visitor may not open answers with `notFound()`, exactly like a page that does not
exist: never a "no permission" screen, never a redirect that reveals the route. The one redirect
is `requireUser()` sending a signed-out visitor of an elderly page to `/login`. For a record
that belongs to someone else: `if (!allowed) notFound();`. `requireAdmin()` already does this
for `/admin`. Expected failures of a form are not system screens: they stay `Field` errors
and `Notice` (see "Show an error").

**Confirm an irreversible action.** `ConfirmDialog` is a client component that takes
function props, so a small `"use client"` wrapper in your lane's `ui/` holds `open` and
calls your Server Action; a Server Component renders the wrapper with plain props. The
button that opens it is `variant="danger"`, the dialog's children say what will happen,
and `confirmLabel` names the action. A failure shows as a `Notice` next to the button.

```tsx
// src/modules/<lane>/ui/ArchiveThingButton.tsx
"use client";

import { useState, useTransition } from "react";
import { Button, ConfirmDialog, Notice } from "@/shared/ui";
import { archiveThingAction } from "../server/thing-actions"; // your own action: returns an ActionResult

export function ArchiveThingButton({ thingId, thingName }: { thingId: string; thingName: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const result = await archiveThingAction(thingId);
      setOpen(false);
      setError(result.ok ? null : result.message);
    });
  }

  return (
    <>
      <Button variant="danger" disabled={pending} onClick={() => setOpen(true)}>
        เก็บเข้าคลัง
      </Button>
      {error ? <Notice tone="danger">{error}</Notice> : null}
      <ConfirmDialog
        open={open}
        title={`เก็บ “${thingName}” เข้าคลัง`}
        confirmLabel="เก็บเข้าคลัง"
        tone="danger"
        onConfirm={confirm}
        onCancel={() => setOpen(false)}
      >
        <ul className="list-disc pl-5">
          <li>รายการนี้จะไม่แสดงในรายการหลักอีก</li>
          <li>ข้อมูลเดิมยังอยู่ และผู้ดูแลระบบขอคืนได้</li>
        </ul>
      </ConfirmDialog>
    </>
  );
}
```

**Show a toast after an action.** `Toast` only draws the message (`message`, and `tone`
`success` or `danger`); your client component decides when it appears, for example from the
state of `useActionState`. Keep the toast in the same client component as the form, in flow
next to the action. A `Toast` never hides itself: it stays until your component stops
rendering it, so only show it while the state says so. `ThingEditor` in the admin form page
recipe (section 5) is the sample: a `Toast` for the success, a `Notice tone="danger"` for a
failure.

## 7. The 3x3 board

The board (engine lane, `<PatternGrid />`) and the Pattern Editor grid (content lane) are
the only hand-built controls in the product. They use only the states, tokens and fixed
geometry below. This geometry is the one place arbitrary sizes are allowed, and only in
these two controls.

**Play board** (elder scope):

| Part            | Look                                                                                                                 |
| --------------- | -------------------------------------------------------------------------------------------------------------------- |
| container       | `grid grid-cols-3`, square (`aspect-square`), `bg-primary-soft`, `rounded-panel` (26px), no shadow                   |
| padding, gap    | 14px padding (`p-3.5`), 12px gap (`gap-3`)                                                                           |
| size            | as large as the screen allows; every cell at least 20mm wide on a phone                                              |
| cell            | square, 20px radius (`rounded-[20px]`), `border-[length:var(--b9-border)] border-edge`, glyph `text-title font-bold` |
| cell at rest    | `bg-surface`, `shadow-cell`                                                                                          |
| shown           | `bg-primary-tint`, no shadow                                                                                         |
| lit             | `bg-primary`, `shadow-cell-lit`                                                                                      |
| tapped in order | `bg-primary`, the order number in `text-on-primary`, no shadow                                                       |
| correct         | `bg-success`, the order number or ✓ in `text-on-primary`, no shadow                                                  |
| wrong           | `bg-danger`, ✕ in `text-on-danger`, no shadow (the words are in the `ResultBanner`)                                  |
| two-finger cue  | a `Notice tone="attention"` above the board                                                                          |

**Pattern Editor grid** (admin scope):

| Part            | Look                                                                                                                         |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| container       | `grid grid-cols-3`, 8px gap (`gap-2`), no background, no padding, no radius, no shadow                                       |
| cell            | square, 1px `border` `border-line-strong`, 10px radius (`rounded-[10px]`), `bg-surface-subtle`, no shadow                    |
| cell number     | 1–9 in the top-left corner, `text-micro text-fg-muted`                                                                       |
| chosen          | `bg-primary border-primary`, the order number in `text-heading font-bold text-on-primary`                                    |
| two-finger step | `bg-attention-soft`, 2px `border-attention` (`border-2`), `text-attention`, both cells share one number and the word "สองนิ้ว" |

In high contrast the shadows turn off and `border-edge` turns white, so every state stays
visible; none rests on colour alone. The play board never moves or resizes while the user
taps, and nothing in it animates. `/design` shows both as pictures.

## 8. Charts (analytics)

There is no chart component and no chart library is approved. The analytics lane draws a
chart itself, following this list:

- Inline SVG in the lane's own component, inside an `AdminSection` (no card around it).
  `StatTile` takes no children, so a chart never goes inside one: a tile that needs a small
  chart is an `infra` issue.
- Colours only from `--chart-1` … `--chart-4`, as `fill-[var(--chart-1)]` /
  `stroke-[var(--chart-1)]`, series in that order. A sequential scale is `--chart-1` at
  100 / 78 / 55 / 35% opacity (`fillOpacity={1}`, `0.78`, `0.55`, `0.35`).
- Axes and grid lines `stroke-line`; labels `fill-fg-muted` in the type tokens
  (`text-small`, `text-micro`).
- Every series is labelled in words, and every chart has a text summary or a table of the
  same numbers beside it, so colour is never the only way to read it.
- No animation.
- A chart library is a dependency: it needs the lead's approval in an `infra` issue first
  (`AGENTS.md` §2.9).
- A chart wider than the 860px column is not supported yet (section 12).

## 9. Motion

Only two things move, both defined by infra: the shared page fade (a typed navigation from
the admin menu or the elder tab bar) and the skeleton-to-content reveal. A lane adds no
animation, no transition, no `ViewTransition` and no typed link of its own. Nothing inside
a training exercise animates, so timing is never affected. Reduced motion switches the fade
off and stills the skeleton.

## 10. Voice

Thai, polite, short, encouraging, never blaming. Buttons are verbs. Numbers are digits.
No English on the elderly side except unavoidable proper nouns. Admin text is plain and
factual; a destructive confirmation says what will happen.

| Instead of                           | Write                              |
| ------------------------------------ | ---------------------------------- |
| "ผิด"                                 | "ไม่เป็นไรนะ ลองอีกครั้ง"               |
| "Error 500"                          | "มีบางอย่างขัดข้อง ลองอีกครั้งนะ"         |
| "OK"                                 | "เสร็จแล้ว" / the verb of the action |
| buttons: "เริ่มฝึก", "จองคิว", "ระงับบัญชี" | (verbs, as written)                |

## 11. Do / Don't

| Do                                              | Don't                                                |
| ----------------------------------------------- | ---------------------------------------------------- |
| a flat `AdminSection` with a heading and a line | a card around a form or a whole section              |
| ✓ or ✕ with words ("✓ ถูกต้อง", "✕ ลองอีกครั้ง")     | green or red alone                                   |
| an icon with a text label                       | an icon alone (only the `ListRow` chevron is exempt) |
| one primary `Button` per screen                 | two primary buttons                                  |
| a skeleton in `Reveal` while data loads         | the text "กำลังโหลด…"                                 |
| `Button` with a `variant`                       | a hand-made button with raw colours                  |

## 12. Known limits

- `line-strong` (#C3CDD3) is 1.62:1 on white. This is a decision by the lead; high-contrast
  mode (2px white borders) is the mitigation. Do not raise it.
- Set `APP_ENV` on every deployment: the admin footer shows it, and it defaults to `local`.
- Not built yet: row selection and rows-per-page in tables. Ask infra when a lane needs one.
- Pages wider than the 860px column (charts, the Pattern Editor) are not supported by
  `AdminShell` yet: open an `infra` issue when the first one is needed.
- Skeleton lines use `1lh` and need Chrome 109, Safari 16.4 or Firefox 120. Browsers
  without view transitions change page at once; nothing breaks.
- `/design` returns 404 in production (it exists on `local` and `staging` only).
- Inside a `<Suspense>` boundary the 404 screen still reveals an admin route to a visitor who
  may not open it: the HTTP status is 200, the static admin menu frame is in the first HTML,
  and the admin page's own `<title>` stays in the first HTML and in the browser tab. Closing
  all three needs the check in `src/proxy.ts` before rendering, which waits for the identity
  lane's sessions.
