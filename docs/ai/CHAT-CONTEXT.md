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
  `bg-surface`, `text-fg`, `text-fg-2`, `text-fg-muted`, `bg-primary`, `text-primary-press`,
  `bg-primary-soft`, `text-danger`, `border-line`, `border-line-strong`, `border-edge`; type
  `text-title|heading|lead|body|small|micro`; sizes `min-h-control`, `min-h-control-sm`,
  `size-icon`, `size-icon-sm`; radii `rounded-control|field|panel|dialog`). Sizes come from the
  scope on the layout root, `data-ui="elder" | "admin"`; never hard-code colours or sizes.
  Vitest.

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

Page:

```tsx
import { Suspense } from "react";
import { CourseList, CreateCourseForm } from "@/modules/content/ui";

export default function Page() {
  return (
    <>
      <Suspense fallback={<p>กำลังโหลด…</p>}>
        <CourseList /> {/* async Server Component: authorizes, then reads the db */}
      </Suspense>
      <CreateCourseForm /> {/* "use client" + useActionState(createCourseAction, null) */}
    </>
  );
}
```

Identity API available to every lane (`@/modules/identity`):
`getCurrentUser(): Promise<CurrentUser | null>`, `requireUser()`, `requireAdmin()`,
`recordAudit({ actorId, action, entityType, entityId?, targetUserId?, metadata? })`.
`CurrentUser = { id, role: "USER" | "ADMIN", firstName, lastName, context: "HOME" | "CENTER", centerId, deviceId }`.

`ActionResult<T> = { ok: true, data: T } | { ok: false, code, message, fieldErrors? }`
with codes `VALIDATION | UNAUTHENTICATED | FORBIDDEN | NOT_FOUND | CONFLICT | INTERNAL`.

Shared UI (`@/shared/ui`): `Button`, `Checkbox`, `ComingSoon`, `ConfirmDialog`, `EmptyState`, `Notice`, `NumberField`, `Select`, `TextField`, `Textarea`, `Toast`.

## Non-negotiable rules

1. TypeScript strict. No `any`, no `@ts-ignore`, no `eslint-disable`.
2. Every query, action and route handler authorizes on the server. An elderly user reads
   only their own data. Only ADMIN reads others', and that calls `recordAudit()`.
3. Validate all input with Zod on the server.
4. Code, comments, commit messages in **English**. Text shown to users in **Thai**,
   polite and encouraging, never blaming.
5. Elderly-friendly UI: touch targets ≥ 64px, large rem-based text, every icon has a text
   label, never colour alone (add ✓ / ✕ / words), one step at a time, confirm before
   anything irreversible.
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
