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
- Zod **4**, Tailwind CSS **4** (tokens in `globals.css` become utilities: colours `bg-page`,
  `bg-surface`, `bg-surface-subtle`, `bg-surface-muted`, `text-fg`, `text-fg-2`,
  `text-fg-muted`, `border-line`, `border-line-strong`, `border-edge`, `bg-primary`,
  `text-on-primary`, `bg-primary-soft` (text on it is `text-primary-press`), `bg-success`,
  `bg-success-soft`, `text-success`, `bg-danger` (text on it is `text-on-danger`),
  `bg-danger-soft`, `text-danger`, `bg-attention-soft`, `text-attention`, `bg-ink`; type
  `text-title|heading|lead|body|small|micro`; sizes `min-h-control`, `min-h-control-sm`,
  `size-icon`, `size-icon-sm`; radii `rounded-control|field|panel|dialog`; a border that must
  thicken in high contrast is `border-[length:var(--b9-border)]`; chart colours are the CSS
  variables `--chart-1` to `--chart-4`). Sizes come from the scope on the layout root,
  `data-ui="elder" | "admin"`; never hard-code colours or sizes. Vitest.

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

Page (admin list page; the only approved shape for a list):

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

Identity API available to every lane (`@/modules/identity`):
`getCurrentUser(): Promise<CurrentUser | null>`, `requireUser()`, `requireAdmin()`,
`recordAudit({ actorId, action, entityType, entityId?, targetUserId?, metadata? })`.
`CurrentUser = { id, role: "USER" | "ADMIN", firstName, lastName, context: "HOME" | "CENTER", centerId, deviceId }`.

`ActionResult<T> = { ok: true, data: T } | { ok: false, code, message, fieldErrors? }`
with codes `VALIDATION | UNAUTHENTICATED | FORBIDDEN | NOT_FOUND | CONFLICT | INTERNAL`.

Shared UI (`@/shared/ui`) — the only components you may use:

- Forms: `Button`, `TextField`, `Textarea`, `NumberField`, `Select`, `Checkbox`, `ChoiceList`,
  `SegmentedControl`, `PinPad`, `DisplaySettings`
- Feedback: `Notice`, `Toast`, `ConfirmDialog`, `ResultBanner`, `Badge`, `EmptyState`,
  `ComingSoon`, `Meter`
- Elderly layout: `ElderHeader`, `StepProgress`, `Section`, `ListRow`, `TabBar`, `TabBarView`
- Admin layout: `AdminShell`, `PageHeader`, `AdminSection`, `SaveBar`, `StatTile`, `Tabs`,
  `Tag`, `StatusDot`
- Tables: `TableCard`, `Table`, `THead`, `TBody`, `Tr`, `Th`, `Td`, `Pagination`, `RowActions`
- Loading: `Reveal`, `SkeletonRegion`, `SkeletonLine`, `SkeletonBlock`, `TableSkeleton`,
  `ListRowSkeleton`, `StatTileSkeleton`, `AdminPageSkeleton`
- Brand: `BrandMark`

## Design rules (the design is closed)

Every screen is built from the design system and nothing else. Hard rules:

- **Components:** build only with `@/shared/ui`. Do not write your own button, field,
  table, dialog, card, badge, tab, menu, skeleton or page frame, and do not restyle a
  shared component through `className` (it is for layout only: width, margin, placement).
- **Missing something?** Stop and tell the user to open an `infra` issue that describes the
  screen and what is missing. Do not hand-roll it and do not add a UI library.
- **Tokens:** no raw colours and no arbitrary colour or font-size values (`#0B7A75`,
  `bg-[#fff]`, `text-[19px]`). ESLint rejects them. Never fix a size in px.
- **Pages follow a recipe**; do not invent a layout.
  - Elderly screens: no cards, one primary button per screen, one step at a time with
    `StepProgress`, every icon has a text label, text never below 17.5px, targets at least 48px.
  - Admin screens: one column, `PageHeader` → `AdminSection`s → optional `SaveBar`. Tables in
    `TableCard` + `Table`, figures in `StatTile`, status as `StatusDot` or `Tag`. Forms are
    one column (at most `max-w-[35rem]`) and never wrapped in a card. One primary action per page.
- **Loading:** a component that reads data is wrapped in `Reveal` (or `Suspense`) with a
  skeleton from `@/shared/ui`, never a line of text.
- **Motion:** only the shared page fade exists. Add no animation, transition or
  `ViewTransition` of your own; nothing inside a training exercise animates.
- **Meaning:** correct and wrong always show ✓ / ✕ **and** words, never colour alone.
- **Irreversible actions** are confirmed with `ConfirmDialog`, stating what will happen.
- **Logo:** `BrandMark` only; do not redraw or recolour it.
- **Exception:** the 3x3 board (engine) and the Pattern Editor grid (content) are built by
  their lanes with the cell states: shown `bg-primary-tint`, lit and tapped `bg-primary`,
  correct `bg-success` with ✓, wrong `bg-danger` with ✕.

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
