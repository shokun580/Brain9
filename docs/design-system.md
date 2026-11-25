# Brain9 design system

Owner: infra (team lead). Read this before you build any screen. It is written for people
and for AI assistants: every rule is a closed list, and every recipe can be copied.

Specs behind it: [`docs/superpowers/specs/2026-11-26-design-system-design.md`](superpowers/specs/2026-11-26-design-system-design.md)
as amended by [`…-amendment-1.md`](superpowers/specs/2026-11-26-design-system-amendment-1.md).
The code is the truth: if this file and the code disagree, tell the lead.

## 1. The rule

The design is closed. A screen is built from the design system and nothing else.

1. Build only with components from `@/shared/ui` and the tokens in `src/app/globals.css`.
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

Defined in `src/app/globals.css`; use them as Tailwind utilities (`bg-…`, `text-…`,
`border-…`). Anything else (raw hex, `bg-[#fff]`, `text-[19px]`) is rejected by ESLint.

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
colour alone: label every series.

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
| `ChoiceList`       | large single choice (3–6 options)    | elder | `name`, `legend`, `options` (`title`, `description`, `badge`, `disabled`), `defaultValue`, `onValueChange`       |
| `SegmentedControl` | compact single choice (2–4 options)  | admin | `name`, `legend`, `defaultValue`, `options`, `onValueChange`                                                     |
| `PinPad`           | PIN entry                            | elder | `length` (4 or 6), `filled`, `onDigit`, `onDelete`, `disabled`                                                   |
| `DisplaySettings`  | text size and high-contrast dialog   | elder | `triggerLabel`; place it in `ElderHeader`'s `action`                                                             |

Field errors come from `ActionResult.fieldErrors`: pass `errors={fieldErrors?.title}`.

### Feedback

| Component       | Use it for                            | Scope | Key props                                                                                       |
| --------------- | ------------------------------------- | ----- | ----------------------------------------------------------------------------------------------- |
| `Notice`        | inline message in a page              | both  | `tone` (`primary` `success` `danger` `attention`), `title`                                      |
| `Toast`         | short confirmation after an action    | both  | `message`, `tone` (`success` `danger`)                                                          |
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

| Component            | Use it for                             | Scope | Key props                                    |
| -------------------- | -------------------------------------- | ----- | -------------------------------------------- |
| `TableCard`          | the one box around a table             | admin | `toolbar` (filters), `footer` (`Pagination`) |
| `Table`              | the table (scrolls sideways when wide) | admin | `aria-label`                                 |
| `THead` `TBody` `Tr` | table structure                        | admin | plain                                        |
| `Th`                 | header cell                            | admin | `numeric`, `sort` (`asc` `desc` `none`)      |
| `Td`                 | body cell                              | admin | `numeric`, `primary`, `muted`                |
| `Pagination`         | row count and page links               | admin | `page`, `pageSize`, `total`, `hrefFor`       |
| `RowActions`         | end-of-row control                     | admin | `primary: {label,href}`, `more`, `rowLabel`  |

### Loading

| Component           | Use it for                                    | Scope | Key props                                           |
| ------------------- | --------------------------------------------- | ----- | --------------------------------------------------- |
| `Reveal`            | Suspense whose skeleton fades into content    | both  | `fallback`, `children`                              |
| `SkeletonRegion`    | one loading area (announced once)             | both  | `label`                                             |
| `SkeletonLine`      | one line of text                              | both  | `width` (`sm` `md` `lg` `full`), `text`             |
| `SkeletonBlock`     | an icon, tile or button shape                 | both  | `shape` (`icon` `icon-tile` `control` `control-sm`) |
| `TableSkeleton`     | a loading table                               | admin | `columns`, `rows`, `lines`, `label` or `bare`       |
| `ListRowSkeleton`   | loading `ListRow`s                            | elder | `rows`, `label` or `bare`                           |
| `StatTileSkeleton`  | loading `StatTile`s                           | admin | `count`, `label` or `bare`                          |
| `AdminPageSkeleton` | generic admin page (the admin layout uses it) | admin | none                                                |

### Brand

| Component   | Use it for                 | Scope | Key props                   |
| ----------- | -------------------------- | ----- | --------------------------- |
| `BrandMark` | the logo, and nothing else | both  | `className` (size), `label` |

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
- Order: `PageHeader` → `AdminSection`s → optional `SaveBar`.
- Cards only for a figure (`StatTile`) or a table (`TableCard`). Never around a form or a
  whole section. No shadows.
- Forms are one column, at most `max-w-[35rem]`, submit button under the fields on the left.
- One primary action per page, in `PageHeader`'s `action` or under a form.
- Status is `StatusDot` (a row's state) or `Tag` (a property). Bold only where section 3 says.

### Admin list page

The reference is `src/app/admin/content/courses/page.tsx` with
`src/modules/content/ui/{CourseList,CourseListSkeleton,course-columns}`.

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
          <ThingList />
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

// src/modules/<lane>/ui/ThingList.tsx — async Server Component: authorize, then read
import { requireAdmin } from "@/modules/identity";
import { EmptyState, StatusDot, Table, TableCard, TBody, Td, Th, THead, Tr } from "@/shared/ui";
import { thingColumns } from "./thing-columns";

export async function ThingList() {
  await requireAdmin();
  const things = await listThingsForAdmin(); // your own query, in server/
  return (
    <TableCard>
      {things.length === 0 ? (
        <EmptyState title="ยังไม่มีรายการ" description="เริ่มเพิ่มรายการแรกได้เลย" />
      ) : (
        <Table aria-label="รายการตัวอย่าง">
          <THead>
            <Tr>
              {thingColumns.map((c) => (
                <Th key={c.label} numeric={c.numeric}>
                  {c.label}
                </Th>
              ))}
            </Tr>
          </THead>
          <TBody>
            {things.map((t) => (
              <Tr key={t.id}>
                <Td primary>{t.name}</Td>
                <Td numeric>{t.count}</Td>
                <Td>
                  <StatusDot tone="ok">เปิดใช้งาน</StatusDot>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}
    </TableCard>
  );
}
```

With paging, read `page` from `searchParams` (a Promise) in a small async component inside
`Reveal`, then count, then `pageRange(rawPage, pageSize, total)`, and pass `r.page`.
Rows with actions end with `<Td><RowActions primary={{ label: "แก้ไข", href }} rowLabel={t.name} /></Td>`.

### Admin form page

One column, no card, the form in a client component of your module (copy
`src/modules/content/ui/CreateCourseForm.tsx`).

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
import { createThingAction, type CreateThingState } from "../server/thing-actions";

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

A long editor (several sections) puts `SaveBar` last: `dirty` from the form's state, the
buttons as children (secondary "ยกเลิก", then the one primary "บันทึก").

### Admin overview with figures

```tsx
import { Users } from "lucide-react";
import { AdminSection, PageHeader, Reveal, StatTile, StatTileSkeleton } from "@/shared/ui";
// OverviewStats lives in your module: async, authorizes, reads, renders the tiles.

export default function AdminOverviewPage() {
  return (
    <>
      <PageHeader title="ภาพรวม" description="สรุปของวันนี้" />
      <AdminSection title="สรุปวันนี้">
        <Reveal fallback={<StatTileSkeleton label="กำลังโหลดตัวเลขสรุป" count={3} />}>
          <OverviewStats />
        </Reveal>
      </AdminSection>
    </>
  );
}

// inside OverviewStats, after the reads:
<div className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3">
  <StatTile
    icon={<Users aria-hidden="true" strokeWidth={1.9} className="size-icon" />}
    label="ผู้ใช้ที่ฝึกวันนี้"
    value="12"
    unit="คน"
    delta={{ text: "เพิ่มขึ้น 2 คนจากเมื่อวาน", tone: "up" }}
  />
</div>;
```

### Elderly step screen

One question, one primary `Button`, "ขั้นที่ X จาก Y". No cards, no second primary.

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
            { value: "test", title: "ทดสอบ", description: "ไม่มีคำใบ้", disabled: true },
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
`subtitle` and `badge`. A list that reads data wraps in `Reveal` with `ListRowSkeleton`:

```tsx
<Section first title="แบบฝึกของฉัน">
  <Reveal fallback={<ListRowSkeleton label="กำลังโหลดรายการ" />}>
    <MyExerciseRows /> {/* async component rendering <ListRow … /> items */}
  </Reveal>
</Section>
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

**Show an error.** A failed form: `Notice tone="danger"` above the submit button, plus
`errors` on the fields. A failed read: `Notice tone="danger"` with a calm next step
("ลองโหลดหน้านี้อีกครั้งนะ"). After an action: `Toast`. Never show a stack trace, a code
or a secret.

## 7. The 3x3 board

The board (engine lane, `<PatternGrid />`) and the Pattern Editor grid (content lane) are
the only hand-built controls in the product. They use these states and tokens.

| Board  | State           | Look                                                                                              |
| ------ | --------------- | ------------------------------------------------------------------------------------------------- |
| Play   | board           | `bg-primary-soft`, `rounded-panel`, square, 14px padding, 12px gap, as large as the screen allows |
| Play   | cell at rest    | `bg-surface`, 20px radius, `shadow-cell`                                                          |
| Play   | shown           | `bg-primary-tint`                                                                                 |
| Play   | lit             | `bg-primary`, `shadow-cell-lit`                                                                   |
| Play   | tapped in order | `bg-primary` with the order number in `text-on-primary`                                           |
| Play   | correct         | `bg-success` with the order number or ✓                                                           |
| Play   | wrong           | `bg-danger` with ✕ (and the words in the banner)                                                  |
| Play   | two-finger cue  | a `Notice tone="attention"` above the board                                                       |
| Editor | grid            | 8px gap; cell `border-line-strong`, 10px radius, `bg-surface-subtle`, small number 1–9 top-left   |
| Editor | chosen          | `bg-primary` with the order number                                                                |
| Editor | two-finger step | `bg-attention-soft`, 2px `border-attention`, both cells share one number                          |

The play board never moves or resizes while the user taps. Every state is also visible in
high contrast and never rests on colour alone. `/design` shows both as pictures.

## 8. Motion

Only two things move, both defined by infra: the shared page fade (a typed navigation from
the admin menu or the elder tab bar) and the skeleton-to-content reveal. A lane adds no
animation, no transition, no `ViewTransition` and no typed link of its own. Nothing inside
a training exercise animates, so timing is never affected. Reduced motion switches the fade
off and stills the skeleton.

## 9. Voice

Thai, polite, short, encouraging, never blaming. Buttons are verbs. Numbers are digits.
No English on the elderly side except unavoidable proper nouns. Admin text is plain and
factual; a destructive confirmation says what will happen.

| Instead of                           | Write                              |
| ------------------------------------ | ---------------------------------- |
| "ผิด"                                 | "ไม่เป็นไรนะ ลองอีกครั้ง"               |
| "Error 500"                          | "มีบางอย่างขัดข้อง ลองอีกครั้งนะ"         |
| "OK"                                 | "เสร็จแล้ว" / the verb of the action |
| buttons: "เริ่มฝึก", "จองคิว", "ระงับบัญชี" | (verbs, as written)                |

## 10. Do / Don't

| Do                                              | Don't                                                |
| ----------------------------------------------- | ---------------------------------------------------- |
| a flat `AdminSection` with a heading and a line | a card around a form or a whole section              |
| ✓ or ✕ with words ("✓ ถูกต้อง", "✕ ลองอีกครั้ง")     | green or red alone                                   |
| an icon with a text label                       | an icon alone (only the `ListRow` chevron is exempt) |
| one primary `Button` per screen                 | two primary buttons                                  |
| a skeleton in `Reveal` while data loads         | the text "กำลังโหลด…"                                 |
| `Button` with a `variant`                       | a hand-made button with raw colours                  |

## 11. Known limits

- `line-strong` (#C3CDD3) is 1.62:1 on white. This is a decision by the lead; high-contrast
  mode (2px white borders) is the mitigation. Do not raise it.
- Set `APP_ENV` on every deployment: the admin footer shows it, and it defaults to `local`.
- Not built yet: row selection and rows-per-page in tables. Ask infra when a lane needs one.
- Skeleton lines use `1lh` and need Chrome 109, Safari 16.4 or Firefox 120. Browsers
  without view transitions change page at once; nothing breaks.
- `/design` returns 404 in production (it exists on `local` and `staging` only).
