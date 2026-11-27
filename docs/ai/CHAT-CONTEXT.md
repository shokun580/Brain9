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
  - icons come from `lucide-react`, sized with `size-icon` / `size-icon-sm`; never set
    `strokeWidth` (the scope sets it)
  - radii `rounded-control|field|panel|dialog`; shadows `shadow-cell`, `shadow-cell-lit`,
    `shadow-overlay` (`shadow-dock` belongs to the tab bar: do not use it)
  - a border that must thicken in high contrast is `border-[length:var(--b9-border)]`
  - chart colours (`--chart-1` to `--chart-4`) belong to `LineChart` / `BarChart`; you never write them

  Sizes come from the scope on the layout root, `data-ui="elder" | "admin"`; never
  hard-code colours or sizes. Elder (`(auth)`, `(elder)`): body text 20px, controls 64px
  high (`size="sm"` 48px), smallest target 48px, text never below 17.5px. Admin: body text
  14.5px, controls 36px high (`size="sm"` 30px), smallest target 30px. Vitest.

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

**Shared screens are infra's.** The entry page `/`, the elderly home `/home`, the admin
overview `/admin`, the 404 and error screens, and every layout, menu and tab bar are designed
and built by infra. Do not build, restyle or rearrange one, even to show the lane's own data
there: export the value or component from the module's entry point and tell the user to
open an `infra` issue so infra places it.

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
            legend="วันนี้ต้องการฝึกแบบใด"
            defaultValue="training"
            options={[
              { value: "training", title: "ฝึก", description: "มีคำใบ้ ฝึกได้ไม่จำกัดครั้ง" },
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
    {/* ArchiveThingButton: a danger Button that opens ConfirmDialog */}
    <ArchiveThingButton thingId={thing.id} thingName={thing.name} />
  </AdminSection>
</>
```

Elderly play and result screens (engine). A training route: read data inside `Suspense`,
never `Reveal`; nothing animates. The board is the engine lane's `PatternGrid` from
`@/modules/engine/ui`. `PatternGrid` is the engine lane's component: here it is a placeholder
until that lane delivers it, with whatever props that lane defines.

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
  <ResultBanner tone="success" headingLevel={2} title="ถูกต้อง ทำได้ดีมาก" detail="ถูก 4 จาก 5 ข้อ" />
</Section>
<Section><PatternGrid /></Section> {/* the board in its final states */}
<Section><Meter label="คะแนนรอบนี้" value={4} max={5} segments valueText="ถูก 4 จาก 5 ข้อ" /></Section>
<Section><Button href={result.nextHref} fullWidth>ทำข้อถัดไป</Button></Section>
```

Sign-in, sign-up, forgotten PIN and sign-out (identity). Full samples are in
`docs/design-system.md` section 5; these are the shapes. Screens with a pad hold no field the
user can focus or type into. A step kept in a client component's state goes back with
`ElderHeader`'s `onBack`; a step at another address uses `backHref`.

- **Elderly sign-in steps.** `/login` is the entry: `BrandMark`, `ElderHeader`, a line and the
  primary `Button` `เข้าสู่ระบบ` (to `/login/pin`), a line and the secondary `Button`
  `สมัครสมาชิก` (to `/signup`). No link for staff. `/login/pin` step 1: `StepProgress`,
  `PhonePad`, primary `ถัดไป`, and a last `Section` with a `TextLink` to `/signup`. Step 2:
  `PinPad` with a `label`, no button (the last digit submits), a `Notice` for a wrong PIN, and
  under the pad a `TextLink` `ลืมรหัส` to `/login/forgot` (until that route exists: the same
  `TextLink` with `onClick`, showing a `Notice tone="primary"` to ask centre staff).

  ```tsx
  // /login
  <BrandMark className="mb-4 size-14" />
  <ElderHeader title="ยินดีต้อนรับสู่ Brain9" />
  <Section first>
    <div className="flex flex-col gap-3">
      <p className="text-body text-fg-2">มีบัญชีอยู่แล้ว</p>
      <Button fullWidth href="/login/pin">เข้าสู่ระบบ</Button>
    </div>
  </Section>
  <Section>
    <div className="flex flex-col gap-3">
      <p className="text-body text-fg-2">ยังไม่มีบัญชี</p>
      <Button variant="secondary" fullWidth href="/signup">สมัครสมาชิก</Button>
    </div>
  </Section>

  // /login/pin step 1, after the primary button: the way to sign-up
  <Section>
    <div className="flex flex-wrap items-center justify-center gap-x-2">
      <span className="text-body text-fg-2">ยังไม่มีบัญชี</span>
      <TextLink href="/signup">สมัครสมาชิก</TextLink>
    </div>
  </Section>

  // /login/pin step 2
  <ElderHeader title="เข้าสู่ระบบ" onBack={onBack} />
  <Section first><StepProgress current={2} total={2} /></Section>
  <Section>
    <div className="flex flex-col items-center gap-4">
      {wrong ? <Notice tone="danger">รหัสยังไม่ถูกต้อง กรุณาใส่อีกครั้ง</Notice> : null}
      <PinPad label="ใส่รหัส 4 หลัก" length={4} filled={pin.length} disabled={checking} onDigit={press} onDelete={back} />
      <TextLink href="/login/forgot">ลืมรหัส</TextLink>
    </div>
  </Section>
  ```

- **Staff sign-in.** `/admin/login`, in the admin scope; the page file is
  `src/app/(staff)/admin/login/page.tsx` and the infra layout of `(staff)` draws the frame
  (`StaffAuthShell`), so the page is only `PageHeader` and the form. Username and password
  (`TextField`), a `Checkbox` that shows the password, one primary `Button`, a `Notice` for a
  failure, a `TextLink` to `/login`. No card, no sign-up, and `/login` does not link here.

  ```tsx
  <PageHeader title="เข้าสู่ระบบ" description="สำหรับเจ้าหน้าที่ศูนย์และผู้ดูแลระบบ" />
  <form action={formAction} className="mt-6 flex flex-col gap-5">
    <TextField label="ชื่อผู้ใช้" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} required errors={fieldErrors?.username} />
    <TextField label="รหัสผ่าน" name="password" type={show ? "text" : "password"} autoComplete="current-password" required errors={fieldErrors?.password} />
    <Checkbox label="แสดงรหัสผ่าน" name="showPassword" checked={show} onChange={(event) => setShow(event.target.checked)} />
    {state && !state.ok && !state.fieldErrors ? <Notice tone="danger">{state.message}</Notice> : null}
    <Button type="submit" fullWidth disabled={pending}>เข้าสู่ระบบ</Button>
  </form>
  <div className="mt-4 flex justify-center">
    <TextLink href="/login">ไปหน้าเข้าสู่ระบบของผู้ใช้ทั่วไป</TextLink>
  </div>
  ```

- **Elderly sign-up steps.** `/signup`, four steps with `StepProgress`, one client component
  owning the step and the values (going back loses only the PIN). 1: `PhonePad`, primary
  `ถัดไป`, a `TextLink` to `/login/pin`; a taken number shows a `Notice tone="primary"` and
  the primary button becomes `ไปหน้าเข้าสู่ระบบ`. 2: the PIN twice on `PinPad`, whose `label`
  says which entry it is; no button; a mismatch or a weak PIN shows a `Notice tone="danger"`
  and starts again. 3: `TextField` first name and last name, primary `ถัดไป`. 4: per policy a
  `Section eyebrow={policy.title}` with the summary in `text-lead` and a `TextLink` that opens
  the full text as a screen inside the same step; three `Checkbox`es, never ticked in
  advance; primary `สมัครสมาชิก`.

  ```tsx
  // step 2 (and /login/new-pin): the label changes between the two entries
  <PinPad
    label={first === undefined ? "ตั้งรหัส 4 หลัก" : "ใส่รหัสเดิมอีกครั้ง"}
    hint={first === undefined ? "เลือกเลขที่จำได้ง่าย" : "เพื่อยืนยันว่าจำรหัสได้"}
    length={4} filled={entry.length} onDigit={press} onDelete={back}
  />

  // step 4
  <Section eyebrow={privacy.title}>
    <p className="text-lead text-fg">{privacy.summary}</p>
    <TextLink onClick={() => setReading(privacy)}>อ่านประกาศฉบับเต็ม</TextLink>
  </Section>
  <Section eyebrow="กรุณาเลือกให้ครบทั้ง 3 ข้อ">
    <div className="flex flex-col gap-2">
      <Checkbox label="ยอมรับข้อตกลงการใช้งาน" name="terms" checked={consents.terms} onChange={…} errors={fieldErrors?.terms} />
      <Checkbox label="ยินยอมให้เก็บชื่อและเบอร์โทรศัพท์" name="personalData" checked={…} onChange={…} errors={…} />
      <Checkbox label="ยินยอมให้เก็บผลการฝึกสมอง" name="cognitiveData" checked={…} onChange={…} errors={…} />
    </div>
  </Section>
  <Section><Button type="submit" fullWidth disabled={pending}>สมัครสมาชิก</Button></Section>
  ```

- **Forgotten PIN screens.** `/login/forgot`: `ElderHeader`, one sentence in `text-lead`,
  `PhonePad`, one primary `Button`. After sending, the same screen for every number: the
  title `ได้รับคำขอแล้ว`, two sentences, one primary `Button` to `/login`; no coloured box, no
  list. `/login/new-pin`: a `Notice tone="success"`, then the PIN twice exactly as in sign-up
  step 2. No `StepProgress` on these.

  ```tsx
  <ElderHeader title="ได้รับคำขอแล้ว" />
  <Section first>
    <div className="flex flex-col gap-4 text-lead text-fg">
      <p>เจ้าหน้าที่จะโทรกลับที่เบอร์นี้ในเวลาทำการ</p>
      <p>หลังคุยกับเจ้าหน้าที่แล้ว กรุณาเปิด Brain9 บนเครื่องนี้อีกครั้งเพื่อตั้งรหัสใหม่</p>
    </div>
  </Section>
  <Section><Button fullWidth href="/login">กลับหน้าแรก</Button></Section>
  ```

- **Elderly profile and sign-out.** `/profile`: `ElderHeader`, a `Section first` with the name
  (read inside `Reveal`), and sign-out in the last `Section`: a secondary `Button fullWidth`
  with an icon and its label, which opens a `ConfirmDialog` before calling the sign-out
  action. Never `danger`, never the primary. Staff sign out from the admin shell's top bar
  (infra wires it); a lane adds no sign-out control to an admin page.

  ```tsx
  <Button variant="secondary" fullWidth onClick={() => setOpen(true)}>
    <LogOut aria-hidden="true" className="size-icon shrink-0" />
    ออกจากระบบ
  </Button>
  <ConfirmDialog open={open} title="ต้องการออกจากระบบหรือไม่" confirmLabel="ออกจากระบบ" onConfirm={signOut} onCancel={() => setOpen(false)}>
    การเข้าใช้ครั้งถัดไปต้องใส่เบอร์โทรศัพท์และรหัส 4 หลักอีกครั้ง
  </ConfirmDialog>
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
- `TextLink` — a quiet way to another screen, in underlined words; `href`, or `onClick` (then it is a button, client only); never an icon alone, never instead of a `Button`
- `Checkbox` — `label`, `name`, `hint`, `errors`, …; the box is drawn by the design system but it is a native checkbox (`checked`, `onChange`, `disabled`)
- `ChoiceList` — elder, 2 to 6 options (more than 6 → an `infra` issue); `name`, `legend`, `options: {value,title,description?,badge?,disabled?}[]` (a disabled option explains itself in `description`), `defaultValue`, `hint`, `errors`, `required`, `onValueChange`
- `SegmentedControl` — admin, 2–3 options; `name`, `legend`, `defaultValue`, `options: {value,label,icon?}[]`, `onValueChange`
- `PinPad` — elder, client; `label?`, `hint?` (which PIN to enter), `length` (4|6), `filled`, `onDigit`, `onDelete`, `disabled`
- `PhonePad` — elder, client; `label`, `value` (digits), `onChange`, `name?` (hidden field), `hint`, `error`, `disabled`; shows `080-000-0000`, does not validate
- `DisplaySettings` — elder, client; `triggerLabel`, `saveAction?` (a Server Action that saves the choice to the signed-in person's account); put it in `ElderHeader`'s `action`. Text size and contrast belong to the person: the layouts apply the account's value on signed-in screens and reset the device to the default on the screens before sign-in. Never read or write `localStorage` for it yourself

Feedback

- `Notice` — `tone` (`primary|success|danger|attention`), `title?`, children
- `Toast` — `message`, `tone` (`success|danger`; danger is not for errors that need action); the caller decides when to show it; an error is shown beside the form, never only in a toast
- `ConfirmDialog` — client; `open`, `title`, children (what will happen), `confirmLabel`, `cancelLabel?`, `tone` (`primary|danger`), `onConfirm`, `onCancel`
- `ResultBanner` — elder; `tone` (`success|danger`), `title`, `detail?`, `headingLevel?`
- `Badge` — elder; `tone` (`neutral|primary|success|danger|attention`), children
- `EmptyState` — `title`, `description?`, `action?`, `headingLevel?`
- `ComingSoon` — `title`, `owner`
- `Meter` — elder; `label`, `value`, `max`, `valueText`, `segments?`

Elderly layout

- `ElderHeader` — `title` or `greeting` + `name`, `backHref?` or `onBack?` (a step kept in client state), `action?`
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
- `AdminShell` — the admin layout only (infra); it draws the staff sign-out in the top bar
- `StaffAuthShell` — the frame of the staff sign-in screen; the `(staff)` layout only (infra)

Tables (admin)

- `TableCard` — `toolbar?` (filters, `Tabs`, `SegmentedControl`), `footer?` (`Pagination`), children
- `Table` (`aria-label`), `THead`, `TBody`, `Tr`, `Th` (`numeric?`, `sort?`), `Td` (`numeric?`, `primary?`, `muted?`)
- `Pagination` — `page`, `pageSize`, `total`, `hrefFor(page)`; first `r = pageRange(rawPage, pageSize, total)` from `@/shared/lib/pagination`, query with `r`, pass `r.page`
- `RowActions` — `primary: {label,href}`, `more?: {label,href}[]`, `rowLabel`

Charts (admin)

- `LineChart`, `BarChart` — client; `title`, `summary` (one sentence with the finding), `data`, `xKey`, `xLabel`, `series: {key,label}[]` (1 to 4), `unit?`, `yMax?`; `BarChart` also `stacked?`

Loading

- `Reveal` — `fallback`, children (a `Suspense` whose skeleton fades into the content)
- `SkeletonRegion` — `label`, children (one per loading area)
- `SkeletonLine` — `width` (`sm|md|lg|full`), `text`; `SkeletonBlock` — `shape` (`icon|icon-tile|control|control-sm`)
- `TableSkeleton` — `columns: {label,numeric?}[]`, `rows?`, `lines?`, and `label` (alone) or `bare` (inside a region)
- `ListRowSkeleton`, `StatTileSkeleton` — `rows?` / `count?`, and `label` or `bare`
- `AdminPageSkeleton` — no props (the admin layout, and a detail page's fallback)

Brand

- `BrandMark` — `className?` (size), `label?`

Client components (`"use client"`): `ConfirmDialog`, `PhonePad`, `PinPad`, `DisplaySettings`, `TabBar`,
`TabBarView`, `AdminShell`. A Server Component must not pass them function props: put
`open`, handlers and Server Action calls in a small `"use client"` component of your own
module's `ui/`. `ChoiceList` and `SegmentedControl` also take a function prop
(`onValueChange`): use it only inside your own `"use client"` component; without it both
work as plain native radios. The same holds for `onBack` on `ElderHeader` and `onClick` on
`TextLink`.

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
- **Number entry (elderly screens):** a PIN is entered only with `PinPad` and a phone
  number only with `PhonePad`. Those screens hold no field the user can focus or type
  into (no `<input>`, visible, off-screen or transparent, and no `contenteditable`), so the
  phone's keyboard never opens. The `type="hidden"` field `PhonePad` renders for a form
  cannot take focus and is the one exception.
- **Motion:** only the shared page fade exists. Add no animation, transition or
  `ViewTransition` of your own; nothing inside a training exercise animates.
- **Meaning:** correct and wrong always show ✓ / ✕ **and** words, never colour alone.
- **Errors** are shown where they happened: `errors` on the field, or a `Notice tone="danger"`
  next to the form. `Toast` is for a success or neutral confirmation only, never the only
  place an error appears.
- **System screens** (404, error) are shared: `src/app/not-found.tsx`, `error.tsx`,
  `global-error.tsx`. A lane adds none. A page the visitor may not open answers with
  `notFound()`, exactly like a page that does not exist: never a "no permission" screen,
  never a redirect that reveals the route. The one redirect is `requireUser()` sending a
  signed-out visitor of an elderly page to `/login`.
- **Irreversible actions** are confirmed with `ConfirmDialog`, stating what will happen.
- **Logo:** `BrandMark` only; do not redraw or recolour it.
- **Exception:** the 3x3 board (engine) and the Pattern Editor grid (content) are built by
  their lanes, using only the cell states, tokens and fixed geometry below. That geometry
  is the one place arbitrary sizes are allowed.
  - Play board (elder): container `grid grid-cols-3`, square (`aspect-square`),
    `bg-primary-soft`, `rounded-panel` (26px), 14px padding (`p-3.5`), 12px gap (`gap-3`),
    no shadow, as large as the screen allows with every cell at least 20mm wide on a phone.
    Cell: square, 20px radius (`rounded-[20px]`), the high-contrast border
    `border-[length:var(--b9-border)] border-edge`, glyph `text-title font-bold`. At rest `bg-surface` + `shadow-cell`; shown
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
- **Charts** (admin screens) are drawn only with `LineChart` and `BarChart` from
  `@/shared/ui`. Do not import `recharts`, do not draw a chart by hand, do not add another
  chart library: a chart these two cannot draw is an `infra` issue. Put the chart in an
  `AdminSection` (no card; `StatTile` takes no children), pass 1 to 4 series and a `summary`
  sentence that states the finding in words (mandatory), and set `unit`. The y axis starts
  at 0. Elderly screens use `Meter`, not charts. Pages wider than the 860px column are not
  supported yet: say so and stop.

  ```tsx
  <AdminSection title="ความแม่นยำรายสัปดาห์">
    <LineChart
      title="ความแม่นยำเฉลี่ยแยกตามศูนย์"
      summary="ศูนย์ตัวอย่าง ก สูงกว่าศูนย์ตัวอย่าง ข ทุกสัปดาห์ที่มีข้อมูล"
      data={rows} // [{ week: "สัปดาห์ 1", centreA: 62, centreB: null }, …]
      xKey="week"
      xLabel="สัปดาห์"
      series={[
        { key: "centreA", label: "ศูนย์ตัวอย่าง ก" },
        { key: "centreB", label: "ศูนย์ตัวอย่าง ข" },
      ]}
      unit="%"
      yMax={100}
    />
  </AdminSection>
  ```

## Non-negotiable rules

1. TypeScript strict. No `any`, no `@ts-ignore`, no `eslint-disable`.
2. Every query, action and route handler authorizes on the server. An elderly user reads
   only their own data. Only ADMIN reads others', and that calls `recordAudit()`.
3. Validate all input with Zod on the server.
4. Code, comments, commit messages in **English**. Text shown to users in **Thai**,
   semi-formal and respectful, never blaming: short, complete sentences that say what
   happened and what to do next. "กรุณา" marks a request (never on a button). No
   sentence-final particles ("นะ", "เลย", "ได้เลย", "ครับ", "ค่ะ") and no "ไม่เป็นไร".
   Example: "ยังไม่ถูกต้อง กรุณาลองอีกครั้ง".
5. UI follows the design rules above: only `@/shared/ui` and tokens, one step at a time on
   the elderly side, every icon has a text label, never colour alone (add ✓ / ✕ / words),
   confirm before anything irreversible. Elderly screens must work on every device (check
   at 360px, 768px, 1280px and the largest text size); admin screens are for an iPad and a
   computer (768px, 1024px, 1440px, usable by touch with no hover or right click).
6. Never output secrets, real names or real phone numbers. Use fake data.
7. Never log PINs, passwords, hashes, tokens or full phone numbers.
8. Pure logic (scoring, validation, metrics, slot rules) gets Vitest unit tests.
9. Database schema changes: edit only `prisma/schema/<lane>.prisma`; tell the user to run
   `pnpm db:migrate --name <lane>_<what>`; never edit an existing migration.
10. No new npm packages. If one seems necessary, say which and why, and stop.
11. Do not invent requirements or columns. If something is unspecified, ask.
12. Security (`docs/security.md`): check an id from the request against the signed-in
    person before using it; a signed-out action runs validate → rate limit → database;
    nothing personal in a URL, log, error or browser storage; no script, style, font,
    image or request to another host and no `<iframe>` (the Content Security Policy blocks
    them); no `dangerouslySetInnerHTML`, `eval` or `$queryRawUnsafe`; redirect only to a
    fixed internal path. A new environment variable, cookie, upload or external service:
    say which and why, and stop.

## Domain facts

- Two roles: `USER` (elderly) and `ADMIN` (caregiver / center staff, sees everything).
- Login: phone number + 4-digit PIN at `/login/pin` (elderly), or username + password at
  `/admin/login` (staff); bcrypt hashes.
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
