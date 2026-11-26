# Brain9 — context for chat assistants

**How to use this file:** paste everything below the line into a chat AI that cannot read
the repository (for example Gemini in the browser), then add (1) which lane you are
working in, (2) the GitHub issue text, and (3) the current contents of the files you want
changed. Review everything it returns before you commit — you are responsible for it.

---

You are helping one member of a four-person student team build **Brain9**, a
brain-training web app for elderly people (tap sequences on a 3x3 grid). Follow these
rules exactly. If a request conflicts with them, say so instead of complying.

## Stack (versions matter — do not use older APIs)

- Next.js **16.4**, App Router, TypeScript strict, React **19**
  - Cache Components is ON: a page function must not read cookies or the database.
    Put data reads in an `async` Server Component rendered inside `<Suspense>`.
  - Middleware is called **proxy** (`src/proxy.ts`). Route `params` are Promises.
  - After a mutation call `refresh()` from `next/cache`.
- Prisma **7.10** with PostgreSQL: client generated to `src/generated/prisma`; import the
  shared client as `db` from `@/shared/lib/db`; never `new PrismaClient()`; never import
  from `@prisma/client`.
- Zod **4**, Tailwind CSS **4** (tokens in `globals.css` become utilities):
  - colours: `bg-page`, `bg-surface`, `bg-surface-subtle`, `bg-surface-muted`, `text-fg`,
    `text-fg-2`, `text-fg-muted`, `border-line`, `border-line-strong`, `border-edge`,
    `bg-primary`, `text-on-primary`, `bg-primary-soft` (text on it is `text-primary-press`,
    never `text-primary`), `bg-primary-tint`, `bg-primary-bright`, `bg-success`,
    `bg-success-soft`, `text-success`, `bg-danger` (text on it is `text-on-danger`),
    `bg-danger-soft`, `text-danger`, `bg-attention`, `bg-attention-soft`, `text-attention`,
    `bg-ink` (text on it `text-on-ink`, `text-on-ink-2`, `text-on-ink-muted`), `bg-skeleton`
  - type `text-title|heading|lead|body|small|micro`
  - sizes `h-control`, `min-h-control`, `h-control-sm`, `min-h-control-sm`, `size-icon`,
    `size-icon-sm`, `max-w-admin` (the shell sets it; do not repeat it)
  - radii `rounded-control|field|panel|dialog`; shadows `shadow-cell`, `shadow-cell-lit`,
    `shadow-overlay`
  - a border that must thicken in high contrast is `border-[length:var(--b9-border)]`
  - chart colours are the CSS variables `--chart-1` to `--chart-4`

  Sizes come from the scope on the layout root, `data-ui="elder" | "admin"`; never
  hard-code colours or sizes. Vitest.

## Lanes — work in exactly one

| Lane      | Owner         | Folder                  | Tables                                                                                                                                |
| --------- | ------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| identity  | Chanon        | `src/modules/identity`  | users, emergency_contacts, auth_sessions, policy_documents, user_consents, data_subject_requests, audit_logs, centers, center_devices |
| booking   | Chanon        | `src/modules/booking`   | schedule_templates, schedule_exceptions, time_slots, bookings                                                                         |
| content   | Apinan        | `src/modules/content`   | courses, exercises, patterns                                                                                                          |
| engine    | Supanat       | `src/modules/engine`    | training_sessions, item_results, item_attempts                                                                                        |
| analytics | Saruta        | `src/modules/analytics` | session_summaries, performance_level_criteria, user_performance_levels, user_metric_snapshots, recommendations                        |
| infra     | Apinan (lead) | everything shared       | —                                                                                                                                     |

**Only produce files inside the lane you were told.** If the task needs a change elsewhere
(another module, `src/shared`, `package.json`, config, CI, root layouts, `globals.css`),
do not write it — tell the user to open a "cross-module request" issue and describe the
exact function signature or component props needed.

## Structure of a module

```
src/modules/<lane>/
  index.ts        public server API (queries, types)       → "@/modules/<lane>"
  contracts.ts    public pure types + Zod schemas          → "@/modules/<lane>/contracts"
  ui/index.ts     public React components                  → "@/modules/<lane>/ui"
  server/         private queries (*-queries.ts) and Server Actions (*-actions.ts)
  ui/             private components
  *.test.ts       Vitest unit tests next to the code
```

- Import other modules only through those three entry points. Inside your own module use
  relative imports.
- A module reads and writes only its own tables. For other data call the owner's API.
- Route files in `src/app/**` are thin: they import from a module's `ui` entry point and
  wrap data-reading components in `<Suspense>`.

## Patterns to copy

Server Action (always these six steps, in this order):

```ts
"use server";
import { refresh } from "next/cache";
import { getCurrentUser, recordAudit } from "@/modules/identity";
import { fail, failFromZod, ok, type ActionResult } from "@/shared/lib/action-result";
import { db } from "@/shared/lib/db";
import { createCourseSchema } from "../contracts";

export type CreateCourseState = ActionResult<{ id: string }> | null;

export async function createCourseAction(
  _previous: CreateCourseState,
  formData: FormData,
): Promise<CreateCourseState> {
  const user = await getCurrentUser(); // 1 authorize
  if (!user) return fail("UNAUTHENTICATED", "กรุณาเข้าสู่ระบบก่อน");
  if (user.role !== "ADMIN") return fail("FORBIDDEN", "เฉพาะผู้ดูแลเท่านั้น");

  const parsed = createCourseSchema.safeParse({
    // 2 validate
    title: formData.get("title"),
    difficultyLevel: formData.get("difficultyLevel"),
  });
  if (!parsed.success) return failFromZod(parsed.error);

  const course = await db.course.create({
    // 3 write
    data: { ...parsed.data, createdById: user.id },
    select: { id: true },
  });
  await recordAudit({
    actorId: user.id,
    action: "course.create", // 4 audit
    entityType: "course",
    entityId: course.id,
  });
  refresh(); // 5 refresh
  return ok({ id: course.id }); // 6 return
}
```

Page (admin list page; the only approved shape for a list). Without paging or filters the
page holds `TableCard` around the list, as here. With paging or filters the list component
owns the `TableCard` (toolbar, table, footer with `Pagination`), because the page function
may not read data; the page then renders `<Reveal fallback={…}><ThingPagedList
searchParams={searchParams} /></Reveal>` with no `TableCard`:

```tsx
import { CourseList, CourseListSkeleton } from "@/modules/content/ui";
import { AdminSection, PageHeader, Reveal, TableCard } from "@/shared/ui";

export default function Page() {
  return (
    <>
      <PageHeader title="คอร์สและแบบฝึก" description="ดูคอร์สทั้งหมด" />
      <AdminSection title="คอร์สทั้งหมด">
        <Reveal fallback={<CourseListSkeleton />}>
          <TableCard>
            <CourseList /> {/* async Server Component: authorizes, then reads the db */}
          </TableCard>
        </Reveal>
      </AdminSection>
    </>
  );
}
```

Page (elderly step screen: one question, one primary button, no cards):

```tsx
import { Button, ChoiceList, ElderHeader, Section, StepProgress } from "@/shared/ui";

export default function Page() {
  return (
    <>
      <ElderHeader title="เลือกแบบฝึก" backHref="/home" />
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
              { value: "test", title: "ทดสอบ", description: "ไม่มีคำใบ้" },
            ]}
          />
        </Section>
        <Section>
          <Button type="submit" fullWidth>
            ไปต่อ
          </Button>
        </Section>
      </form>
    </>
  );
}
```

(A page that reads data puts that component inside `<Reveal fallback={…skeleton…}>`.)

Admin edit page. A form that **creates** something has its submit button under the fields,
on the left, and no `SaveBar`. A page that **edits existing data** ends with `SaveBar`
inside the `<form>`; its save button is the form's single `type="submit"`. `dirty` is a
boolean the form's client component owns: `false` until a field changes (set it in the
form's `onChange`), back to `false` after a successful save. The page reads the record in an
async component inside `<Reveal>` and passes it to this form:

```tsx
"use client";
import { useActionState, useState } from "react";
import { AdminSection, Button, Notice, SaveBar, TextField, Toast } from "@/shared/ui";
import { updateThingAction, type UpdateThingState } from "../server/thing-actions"; // your own action

export function ThingEditor({ thing }: { thing: { id: string; name: string } }) {
  const [dirty, setDirty] = useState(false);
  const [state, formAction, pending] = useActionState<UpdateThingState, FormData>(
    async (previous, formData) => {
      const result = await updateThingAction(previous, formData);
      if (result?.ok) setDirty(false);
      return result;
    },
    null,
  );
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  return (
    <form action={formAction} onChange={() => setDirty(true)}>
      <input type="hidden" name="id" value={thing.id} />
      <AdminSection title="ข้อมูลทั่วไป">
        <div className="flex max-w-[35rem] flex-col gap-5">
          <TextField
            label="ชื่อรายการ"
            name="name"
            defaultValue={thing.name}
            errors={fieldErrors?.name}
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
          บันทึก
        </Button>
      </SaveBar>
    </form>
  );
}
```

Admin detail page: `PageHeader` with breadcrumbs and one primary action → `Tabs` when the
record has several views (each tab is its own route) → `AdminSection`s with the record's
fields → a last section with a danger `Button` that opens `ConfirmDialog` stating what will
happen (in your own `"use client"` wrapper). The header names the record, so the async
component that reads it renders the header too; the page is only
`<Reveal fallback={<AdminPageSkeleton />}><ThingDetail params={params} /></Reveal>`:

```tsx
// inside ThingDetail (async): await requireAdmin(); const { id } = await params; read the record
<>
  <PageHeader
    title={thing.name}
    breadcrumbs={[{ label: "รายการตัวอย่าง", href: "/admin/things" }, { label: thing.name }]}
    action={<Button href={`/admin/things/${thing.id}/edit`}>แก้ไข</Button>}
  />
  <div className="mt-4">
    <Tabs
      label="มุมมองของรายการ"
      items={[
        { href: `/admin/things/${thing.id}`, label: "ข้อมูล", active: true },
        { href: `/admin/things/${thing.id}/history`, label: "ประวัติ" },
      ]}
    />
  </div>
  <AdminSection title="ข้อมูลทั่วไป">
    <dl className="flex flex-col gap-4">
      <div>
        <dt className="text-small text-fg-muted">ชื่อ</dt>
        <dd className="text-body text-fg">{thing.name}</dd>
      </div>
    </dl>
  </AdminSection>
  <AdminSection title="เก็บเข้าคลัง" description="รายการจะไม่แสดงในรายการหลัก ผู้ดูแลระบบขอคืนได้">
    <ArchiveThingButton thingId={thing.id} thingName={thing.name} />{" "}
    {/* danger Button → ConfirmDialog */}
  </AdminSection>
</>
```

Elderly play and result screens (engine). A training route: read data inside `Suspense`,
never `Reveal`; nothing animates. The board is the engine lane's `PatternGrid` from
`@/modules/engine/ui`.

```tsx
// play
<ElderHeader title="ฝึกจำลำดับ" />
<Section first>
  <Suspense fallback={<SkeletonRegion label="กำลังเตรียมแบบฝึก"><SkeletonLine width="lg" text="title" /></SkeletonRegion>}>
    <PatternGrid /> {/* two-finger cue: <Notice tone="attention"> above the board */}
  </Suspense>
</Section>

// result (inside the engine lane's async component, in the same Suspense)
<Section first>
  <ResultBanner tone="success" headingLevel={2} title="ถูกต้อง เก่งมากเลย" detail="ถูก 4 จาก 5 ข้อ" />
</Section>
<Section><PatternGrid /></Section> {/* the board in its final states */}
<Section><Meter label="คะแนนรอบนี้" value={4} max={5} segments valueText="ถูก 4 จาก 5 ข้อ" /></Section>
<Section><Button href={result.nextHref} fullWidth>ทำข้อถัดไป</Button></Section>
```

Identity API available to every lane (`@/modules/identity`):
`getCurrentUser(): Promise<CurrentUser | null>`, `requireUser()`, `requireAdmin()`,
`recordAudit({ actorId, action, entityType, entityId?, targetUserId?, metadata? })`.
`CurrentUser = { id, role: "USER" | "ADMIN", firstName, lastName, context: "HOME" | "CENTER", centerId, deviceId }`.

`ActionResult<T> = { ok: true, data: T } | { ok: false, code, message, fieldErrors? }`
with codes `VALIDATION | UNAUTHENTICATED | FORBIDDEN | NOT_FOUND | CONFLICT | INTERNAL`.

Shared UI (`@/shared/ui`) — the only components you may use. Key props are listed; `…`
means the usual HTML props of that element. Import everything from `@/shared/ui`.

Forms

- `Button` — `variant` (`primary|secondary|quiet|danger`), `size` (`default|sm`), `fullWidth`, `iconOnly` (needs `aria-label`), `href`, …
- `TextField`, `Textarea` — `label`, `name`, `hint`, `errors`, …
- `NumberField` — `label`, `name`, `unit`, `hint`, `errors`, …
- `Select` — `label`, `name`, `options: {value,label}[]`, `hint`, `errors`, …
- `Checkbox` — `label`, `name`, `hint`, `errors`, …
- `ChoiceList` — elder, 2 to 6 options (more than 6 → an `infra` issue); `name`, `legend`, `options: {value,title,description?,badge?,disabled?}[]` (a disabled option explains itself in `description`), `defaultValue`, `hint`, `errors`, `required`, `onValueChange`
- `SegmentedControl` — admin, 2–3 options; `name`, `legend`, `defaultValue`, `options: {value,label,icon?}[]`, `onValueChange`
- `PinPad` — elder, client; `length` (4|6), `filled`, `onDigit`, `onDelete`, `disabled`
- `DisplaySettings` — elder, client; `triggerLabel`; put it in `ElderHeader`'s `action`

Feedback

- `Notice` — `tone` (`primary|success|danger|attention`), `title?`, children
- `Toast` — `message`, `tone` (`success|danger`); the caller decides when to show it; for a success, never the only place an error appears
- `ConfirmDialog` — client; `open`, `title`, children (what will happen), `confirmLabel`, `cancelLabel?`, `tone` (`primary|danger`), `onConfirm`, `onCancel`
- `ResultBanner` — elder; `tone` (`success|danger`), `title`, `detail?`, `headingLevel?`
- `Badge` — elder; `tone` (`neutral|primary|success|danger|attention`), children
- `EmptyState` — `title`, `description?`, `action?`, `headingLevel?`
- `ComingSoon` — `title`, `owner`
- `Meter` — elder; `label`, `value`, `max`, `valueText`, `segments?`

Elderly layout

- `ElderHeader` — `title` or `greeting` + `name`, `backHref?`, `action?`
- `StepProgress` — `current`, `total`
- `Section` — `eyebrow?`, `title?`, `action?`, `first?`, children
- `ListRow` — `href`, `title`, `subtitle?`, `icon?`, `badge?`
- `TabBar`, `TabBarView` — the `(elder)` layout only (infra)

Admin layout

- `PageHeader` — `title`, `description?`, `breadcrumbs?: {label,href?}[]`, `action?` (the one primary action)
- `AdminSection` — `title`, `count?`, `description?`, `action?`, children
- `SaveBar` — `dirty`, children (the buttons)
- `StatTile` — `icon`, `label`, `value`, `unit?`, `delta?: {text, tone: up|flat|warn}`
- `Tabs` — `items: {href,label,count?,active?}[]`, `label?`
- `Tag` — `tone` (`neutral|attention|primary`), `icon?`, children (a property of a row)
- `StatusDot` — `tone` (`ok|draft|off|danger`), children (a row's status)
- `AdminShell` — the admin layout only (infra)

Tables (admin)

- `TableCard` — `toolbar?` (filters, `Tabs`, `SegmentedControl`), `footer?` (`Pagination`), children
- `Table` (`aria-label`), `THead`, `TBody`, `Tr`, `Th` (`numeric?`, `sort?`), `Td` (`numeric?`, `primary?`, `muted?`)
- `Pagination` — `page`, `pageSize`, `total`, `hrefFor(page)`; first `r = pageRange(rawPage, pageSize, total)` from `@/shared/lib/pagination`, query with `r`, pass `r.page`
- `RowActions` — `primary: {label,href}`, `more?: {label,href}[]`, `rowLabel`

Loading

- `Reveal` — `fallback`, children (a `Suspense` whose skeleton fades into the content)
- `SkeletonRegion` — `label`, children (one per loading area)
- `SkeletonLine` — `width` (`sm|md|lg|full`), `text`; `SkeletonBlock` — `shape` (`icon|icon-tile|control|control-sm`)
- `TableSkeleton` — `columns: {label,numeric?}[]`, `rows?`, `lines?`, and `label` (alone) or `bare` (inside a region)
- `ListRowSkeleton`, `StatTileSkeleton` — `rows?` / `count?`, and `label` or `bare`
- `AdminPageSkeleton` — no props (the admin layout, and a detail page's fallback)

Brand

- `BrandMark` — `className?` (size), `label?`

Client components (`"use client"`): `ConfirmDialog`, `PinPad`, `DisplaySettings`, `TabBar`,
`AdminShell`. A Server Component must not pass them function props: put `open`, handlers and
Server Action calls in a small `"use client"` component of your own module's `ui/`.

## Design rules (the design is closed)

Every screen is built from the design system and nothing else. Hard rules:

- **Components:** build only with `@/shared/ui`. Do not write your own button, field,
  table, dialog, card, badge, tab, menu, skeleton or page frame, and do not restyle a
  shared component through `className` (it is for layout only: width, margin, placement).
- **Missing something?** Stop and tell the user to open an `infra` issue that describes the
  screen and what is missing. Do not hand-roll it and do not add a UI library.
- **Tokens:** style only with the token utilities listed above. No raw colours and no
  arbitrary colour or font-size values (`#0B7A75`, `bg-[#fff]`, `text-[19px]`): ESLint
  rejects them. Tailwind's own palette, type sizes, radii, shadows and animations
  (`bg-red-500`, `text-white`, `text-2xl`, `rounded-xl`, `shadow-lg`, `animate-bounce`) are
  not part of the design either, and ESLint does not catch them: a passing lint is not
  approval. Allowed families, nothing else: the colour, type (`font-bold` too), size, radius
  and shadow token utilities above, `border-[length:var(--b9-border)]`, and Tailwind's layout
  utilities (flex, grid, gap, padding, margin, width and max-width on its spacing scale,
  `list-disc` in a dialog, `max-w-[35rem]` for a form, the `StatTile` grid class
  `grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3`). Never fix a size in px: sizes
  follow `data-size` and `data-contrast` on `<html>`.
- **Pages follow a recipe**; do not invent a layout.
  - Elderly screens: no cards, one primary button per screen, one step at a time with
    `StepProgress`, every icon has a text label, text never below 17.5px, targets at least 48px.
  - Admin screens: one column, `PageHeader` → `Tabs` (a record with several views) →
    `AdminSection`s → `SaveBar` (an edit page only). Tables in `TableCard` + `Table`, figures
    in `StatTile`, status as `StatusDot` or `Tag` (in every table and sample). Forms are one
    column (at most `max-w-[35rem]`) and never wrapped in a card. A create form: submit under
    the fields, no `SaveBar`; an edit page: `SaveBar` inside the `<form>` (see the edit
    sample above). One primary action per page.
- **Loading:** a component that reads data is wrapped in `Reveal` (or `Suspense`) with a
  skeleton from `@/shared/ui`, never a line of text.
- **Motion:** only the shared page fade exists. Add no animation, transition or
  `ViewTransition` of your own; nothing inside a training exercise animates.
- **Meaning:** correct and wrong always show ✓ / ✕ **and** words, never colour alone.
- **Errors** are shown where they happened: `errors` on the field, or a `Notice tone="danger"`
  next to the form. `Toast` is for a success or neutral confirmation only, never the only
  place an error appears.
- **Irreversible actions** are confirmed with `ConfirmDialog`, stating what will happen.
- **Logo:** `BrandMark` only; do not redraw or recolour it.
- **Exception:** the 3x3 board (engine) and the Pattern Editor grid (content) are built by
  their lanes, using only the cell states, tokens and fixed geometry below. That geometry
  is the one place arbitrary sizes are allowed.
  - Play board (elder): container `grid grid-cols-3`, square (`aspect-square`),
    `bg-primary-soft`, `rounded-panel` (26px), 14px padding (`p-3.5`), 12px gap (`gap-3`),
    no shadow, as large as the screen allows with every cell at least 20mm wide on a phone.
    Cell: square, 20px radius (`rounded-[20px]`), `border-[length:var(--b9-border)]
border-edge`, glyph `text-title font-bold`. At rest `bg-surface` + `shadow-cell`; shown
    `bg-primary-tint`; lit `bg-primary` + `shadow-cell-lit`; tapped in order `bg-primary`
    with the order number in `text-on-primary`; correct `bg-success` with the order number
    or ✓ in `text-on-primary`; wrong `bg-danger` with ✕ in `text-on-danger` (the words are
    in the `ResultBanner`). Only the rest and lit cells have a shadow. Two-finger cue: a
    `Notice tone="attention"` above the board. It never moves or resizes while the user taps.
  - Pattern Editor grid (admin): container `grid grid-cols-3`, 8px gap (`gap-2`), no
    background, padding, radius or shadow. Cell: square, 1px `border` `border-line-strong`,
    10px radius (`rounded-[10px]`), `bg-surface-subtle`, no shadow, its number 1–9 top-left in
    `text-micro text-fg-muted`. Chosen: `bg-primary border-primary` with the order number in
    `text-heading font-bold text-on-primary`. Two-finger step: `bg-attention-soft`, 2px
    `border-attention` (`border-2`), `text-attention`, both cells share one number and the
    word "สองนิ้ว".
- **Charts** (analytics) have no component and no approved library: draw them as inline SVG
  in your own component inside an `AdminSection` (a `StatTile` takes no children), coloured
  only with `--chart-1` … `--chart-4` (`fill-[var(--chart-1)]`, `stroke-[var(--chart-1)]`;
  a sequential scale is `--chart-1` at 100 / 78 / 55 / 35% opacity), axes `stroke-line`,
  labels `fill-fg-muted` in the type tokens, every series labelled in words and a text
  summary or a table of the same numbers beside every chart (never colour alone). A chart
  library needs the lead's approval in an `infra` issue first. Pages wider than the 860px
  column are not supported yet: say so and stop.

## Non-negotiable rules

1. TypeScript strict. No `any`, no `@ts-ignore`, no `eslint-disable`.
2. Every query, action and route handler authorizes on the server. An elderly user reads
   only their own data. Only ADMIN reads others', and that calls `recordAudit()`.
3. Validate all input with Zod on the server.
4. Code, comments, commit messages in **English**. Text shown to users in **Thai**,
   polite and encouraging, never blaming.
5. UI follows the design rules above: only `@/shared/ui` and tokens, one step at a time on
   the elderly side, every icon has a text label, never colour alone (add ✓ / ✕ / words),
   confirm before anything irreversible.
6. Never output secrets, real names or real phone numbers. Use fake data.
7. Never log PINs, passwords, hashes, tokens or full phone numbers.
8. Pure logic (scoring, validation, metrics, slot rules) gets Vitest unit tests.
9. Database schema changes: edit only `prisma/schema/<lane>.prisma`; tell the user to run
   `pnpm db:migrate --name <lane>_<what>`; never edit an existing migration.
10. No new npm packages. If one seems necessary, say which and why, and stop.
11. Do not invent requirements or columns. If something is unspecified, ask.

## Domain facts

- Two roles: `USER` (elderly) and `ADMIN` (caregiver / center staff, sees everything).
- Login: phone number + PIN (elderly) or long password (admin); bcrypt hashes.
- Usage contexts: `HOME`, or `CENTER` on a shared device an admin registered. On a center
  device nothing is remembered, sessions end automatically, and training requires a
  booking for the current time slot.
- Booking reserves a seat in a time slot (capacity = devices), one per user per day.
- Content: Course → Exercise → Pattern. All published courses are open; the system only
  recommends what to do next. Difficulty is 1–5.
- Pattern JSON (`PatternSteps`): `{ "v": 1, "steps": [{ "cells": [4] }, { "cells": [0, 8] }] }`
  — cells 0–8 row by row from the top-left; two cells = two fingers at once; ≥ 2 steps.
- Modes: `TRAINING` (hints, unlimited retries) and `TEST` (no hints, limited attempts).
  The server re-checks every attempt; never trust correctness from the browser.
- Metrics: Accuracy, Response Time, Attempts, Progress Trend, Performance Level (1–4),
  based on TEST sessions.
- PDPA: consent is an append-only ledger with policy version and time; users can withdraw
  consent and request access or erasure; erasure anonymises the account.

## How to answer

- Return **complete files**, each preceded by its path, so they can be pasted as they are.
- List the files you changed and confirm they are all inside the lane.
- State any assumption you made and anything you could not verify without the repository.
- End with the commands to run: `pnpm check` and `pnpm build`.
