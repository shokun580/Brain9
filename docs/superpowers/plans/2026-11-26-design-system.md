# Brain9 Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the demov1 look with the approved Brain9 design system: tokens, two UI
scopes (elderly and admin), 33 shared components, a live `/design` reference page, the
written rules, and a lint rule that keeps raw colours out of feature code.

**Architecture:** Colour, type and size tokens are CSS custom properties in
`src/app/globals.css`, exposed to Tailwind 4 with `@theme inline`. Layouts mark their
root with `data-ui="elder"` or `data-ui="admin"`; each scope sets the type scale and
control sizes, and shared components read those variables without knowing the scope.
Components are plain React (Server Components unless they hold state) in
`src/shared/ui`, tested by rendering to static HTML.

**Tech Stack:** Next.js 16.4 (App Router, Cache Components on), React 19, Tailwind CSS 4,
TypeScript strict, Vitest 5 (node environment), lucide-react (new), pnpm 10, Node 24.

**Spec:** `docs/superpowers/specs/2026-11-26-design-system-design.md`. Visual reference:
`docs/design-system/mockups/elder.html` and `admin.html` (open in a browser).

## Global Constraints

- Read `AGENTS.md` first. All files here are infra-owned; the lane for commits is `infra`.
- Before touching Next.js APIs read the matching guide under `node_modules/next/dist/docs/`.
- No new dependency other than `lucide-react`. No jsdom, no Testing Library.
- Font: LINE Seed Sans TH, weights **400 and 700 only**.
- Primary `#0B7A75`; success `#1E7A3C`; danger `#B42318`; attention `#9A5B00`; ink `#122029`.
- Minimum text size: 17.5px in the `elder` scope, 12.5px in the `admin` scope.
- Elderly side: no cards; one primary action per screen; an icon always has a visible
  text label (the list-row chevron is the only exception).
- Correct / wrong is never colour alone: success always renders ✓ and a word, danger
  always renders ✕ and a word.
- High contrast (`data-contrast="high"`) and text size (`data-size`) affect the `elder`
  scope only.
- Components in `src/shared/ui` never read data, never import from `src/modules` or
  `src/app`, and never check which scope they are in.
- Code, comments, commits and docs in English; UI text in Thai, polite and encouraging.
- TypeScript strict: no `any`, no `@ts-ignore`, no `eslint-disable`.
- Before every commit: `pnpm check`. Before every push: `pnpm check && pnpm build`.
- Commit messages: Conventional Commits with scope `infra`, ending with the
  `Co-Authored-By` line the session provides.
- Four pull requests into `staging`, in order; each leaves the app working. Do not start
  a PR's tasks until the previous PR is merged and `staging` is pulled.

## Review Focus

1. **Stored display settings are missing, blocked or garbage** (private window, cleared
   site data, a hand-edited value): the page renders with the defaults and never throws.
   → Task 8 tests.
2. **Text size 140% on a 360px-wide phone with long Thai labels:** buttons, list rows and
   the tab bar wrap or shrink; nothing is clipped or scrolls sideways. → Task 9 browser
   check.
3. **Pagination at the edges:** zero rows, a page number past the end, a single page.
   → Task 10 tests.
4. **`/design` in production:** returns 404; it must not expose an unfinished page on the
   public domain. → Task 14 test.
5. **Scope leakage:** high contrast or text size changing the admin console, or admin
   sizes appearing on an elderly screen. → Task 2 token contract test.

---

## File map

```
src/app/globals.css                    tokens, scopes, high contrast, text size        (T2)
src/app/layout.tsx                     font weights, body classes, no-flash script     (T2, T8)
src/app/page.tsx                       redirect to /home                               (T9)
src/app/(auth)/layout.tsx              elder scope, no tab bar                         (T9)
src/app/(elder)/layout.tsx             elder scope + TabBar                            (T9)
src/app/(elder)/home/page.tsx          elderly home shell                              (T9)
src/app/admin/nav.ts                   admin menu definition                           (T12)
src/app/admin/layout.tsx               admin scope + AdminShell                        (T5, T12)
src/app/design/                        /design reference page                          (T14)
src/shared/lib/contrast.ts             WCAG contrast ratio                             (T2)
src/shared/ui/*.tsx                    one component per file                          (T3–T12)
src/shared/ui/index.ts                 public exports                                  (every task)
src/modules/content/ui/*               reference slice restyled                        (T5, T13)
test/render.tsx                        html() test helper                              (T1)
eslint.config.mjs                      design rule                                     (T15)
docs/design-system.md, AGENTS.md, docs/ai/CHAT-CONTEXT.md                              (T16)
```

Conventions for every component task:

- File `src/shared/ui/<Name>.tsx`, named export, props type exported as `<Name>Props`,
  test `src/shared/ui/<Name>.test.tsx`, export added to `src/shared/ui/index.ts`.
- Tests render with `html()` from Task 1 and assert on the returned string.
- Add `"use client"` only where the task says so.
- Icons come from `lucide-react`, `strokeWidth={1.9}`, `aria-hidden`.

---

# PR 1 — Foundations (branch `feat/infra-design-system`, already checked out)

The spec, the mockups and this plan are already in the working tree of this branch and
ship with PR 1.

### Task 1: Component test harness and icon library

**Files:**

- Create: `test/render.tsx`, `src/shared/ui/harness.test.tsx`
- Modify: `package.json`, `pnpm-lock.yaml`

**Interfaces:**

- Produces: `html(node: React.ReactElement): string` exported from `test/render.tsx`
  (wraps `renderToStaticMarkup` from `react-dom/server`). Tests import it as
  `import { html } from "../../../test/render"`.

- [ ] **Step 1:** `pnpm add lucide-react`
- [ ] **Step 2: Write the failing test** `src/shared/ui/harness.test.tsx`

```tsx
import { Check } from "lucide-react";
import { expect, it } from "vitest";
import { html } from "../../../test/render";

it("renders React elements and lucide icons to static HTML", () => {
  const out = html(
    <p className="x">
      สวัสดี <Check aria-hidden />
    </p>,
  );
  expect(out).toContain('<p class="x">สวัสดี');
  expect(out).toContain("<svg");
});
```

- [ ] **Step 3:** Run `pnpm test`. Expected: FAIL, cannot resolve `../../../test/render`.
- [ ] **Step 4:** Implement `html()` in `test/render.tsx`.
- [ ] **Step 5:** Run `pnpm test`. Expected: PASS (13 tests).
- [ ] **Step 6: Commit** `chore(infra): add lucide-react and a static-render test helper`
      (include `docs/superpowers/`, `docs/design-system/`, `.gitignore`, `.prettierignore`).

### Task 2: Tokens, scopes and the contrast helper

**Files:**

- Create: `src/shared/lib/contrast.ts`, `src/shared/lib/contrast.test.ts`,
  `src/app/tokens.test.ts`
- Modify: `src/app/globals.css` (replace everything after `@import "tailwindcss";`),
  `src/app/layout.tsx`
- Delete: `src/app/fonts/LINESeedSansTH_XBd.ttf`

**Interfaces:**

- Produces: `contrastRatio(a: string, b: string): number` (hex in, WCAG ratio out).
- Produces Tailwind utilities (later tasks use exactly these names):
  - colours: `page`, `surface`, `surface-subtle`, `surface-muted`, `fg`, `fg-2`,
    `fg-muted`, `line`, `line-strong`, `primary`, `primary-press`, `primary-soft`,
    `primary-tint`, `primary-bright`, `on-primary`, `success`, `success-soft`, `danger`,
    `danger-soft`, `attention`, `attention-soft`, `ink`, `focus`
    (e.g. `bg-page`, `text-fg-muted`, `border-line-strong`)
  - type: `text-title`, `text-heading`, `text-lead`, `text-body`, `text-small`,
    `text-micro` (size + line-height; weight is set with `font-bold`)
  - sizes: `h-control`, `min-h-control`, `h-control-sm`, `min-h-control-sm`
  - radii: `rounded-control`, `rounded-field`, `rounded-panel`, `rounded-dialog`
  - shadows: `shadow-cell`, `shadow-cell-lit`, `shadow-overlay`
  - chart variables `--chart-1` … `--chart-4` (plain CSS variables, no utilities)

- [ ] **Step 1: Write the failing contrast test**

```ts
import { expect, it } from "vitest";
import { contrastRatio } from "./contrast";

it("computes WCAG contrast ratios", () => {
  expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
  expect(contrastRatio("#FFFFFF", "#FFFFFF")).toBeCloseTo(1, 5);
  expect(contrastRatio("#0B7A75", "#FFFFFF")).toBeGreaterThan(4.5);
  expect(contrastRatio("#fff", "#000")).toBeCloseTo(21, 1); // 3-digit and lower case
});
```

- [ ] **Step 2:** Run it. Expected: FAIL (module not found). Implement `contrastRatio`
      (sRGB relative luminance, `(L1 + 0.05) / (L2 + 0.05)`). Run. Expected: PASS.

- [ ] **Step 3: Write the failing token contract test** `src/app/tokens.test.ts`. It
      reads `src/app/globals.css` as text and asserts:

```ts
// 1. every default colour from spec §5.1 is declared in :root with this exact value
const ROOT = {
  "--b9-page": "#F5F7F8",
  "--b9-surface": "#FFFFFF",
  "--b9-surface-subtle": "#F8FAFB",
  "--b9-surface-muted": "#EEF2F4",
  "--b9-fg": "#14202B",
  "--b9-fg-2": "#3B4854",
  "--b9-fg-muted": "#5A6873",
  "--b9-line": "#E1E7EA",
  "--b9-line-strong": "#C3CDD3",
  "--b9-primary": "#0B7A75",
  "--b9-primary-press": "#08625E",
  "--b9-primary-soft": "#E3F2F0",
  "--b9-primary-tint": "#BDE2DD",
  "--b9-primary-bright": "#4FD1C5",
  "--b9-on-primary": "#FFFFFF",
  "--b9-success": "#1E7A3C",
  "--b9-success-soft": "#E4F3E8",
  "--b9-danger": "#B42318",
  "--b9-danger-soft": "#FDECEA",
  "--b9-attention": "#9A5B00",
  "--b9-attention-soft": "#FFF1DC",
  "--b9-ink": "#122029",
};
// 2. AA contrast (>= 4.5) for: fg/surface, fg/page, fg-2/surface, fg-muted/surface, fg-muted/page,
//    on-primary/primary, primary/surface, primary-press/primary-soft, success/success-soft,
//    danger/danger-soft, attention/attention-soft, #FFFFFF/danger, #FFFFFF/ink
// 3. the css contains a `[data-ui="elder"]` block with --b9-text-title: calc(35px * var(--b9-scale))
//    and --b9-control-h: 64px, and a `[data-ui="admin"]` block with --b9-text-body: 14.5px
//    and --b9-control-h: 36px
// 4. every selector that mentions data-contrast or data-size also mentions [data-ui="elder"]
// 5. the high-contrast block sets --b9-primary: #5EEAD4 and --b9-on-primary: #000000
// 6. no hex colour appears inside the `@theme inline` block (it must only reference var(--b9-*))
```

- [ ] **Step 4:** Run it. Expected: FAIL (old tokens).

- [ ] **Step 5: Rewrite `globals.css`** with these blocks, in this order:
  1. `:root` — the colours above, `--b9-focus: #0B7A75`, plus `--chart-1: var(--b9-primary); --chart-2: #3B6FB6;
--chart-3: #9A5B00; --chart-4: #6B4FA8; --b9-scale: 1; --b9-border: 1px;
color-scheme: light`.
  2. `[data-ui="elder"]` — `--b9-text-title: calc(35px * var(--b9-scale))`, heading 27px,
     lead 22px, body 20px, small 17.5px (all multiplied by `--b9-scale`), micro equal to
     small; `--b9-control-h: 64px; --b9-control-h-sm: 48px; --b9-radius-control: 18px;
--b9-radius-field: 14px; --b9-radius-panel: 26px; --b9-radius-dialog: 26px`; plus
     `font-size: var(--b9-text-body); line-height: 1.6`.
  3. `[data-ui="admin"]` — title 22px, heading 17px, lead 15.5px, body 14.5px, small 13px,
     micro 12.5px; control 36px, control-sm 30px; radii control 8px, field 8px, panel
     10px, dialog 12px; `--b9-scale: 1`; `font-size: var(--b9-text-body); line-height: 1.5`.
  4. `html[data-size="2"] [data-ui="elder"] { --b9-scale: 1.2 }`, `"3"` → `1.4`.
  5. `html[data-contrast="high"] [data-ui="elder"]` — every value from spec §5.2,
     `--b9-border: 2px`, `color-scheme: dark`.
  6. `@theme inline` — map each `--color-<name>` to `var(--b9-<name>)`; `--text-title:
var(--b9-text-title)` with `--text-title--line-height: 1.3` (same for heading; lead
     1.35; body 1.6; small 1.5; micro 1.4); `--spacing-control: var(--b9-control-h)`,
     `--spacing-control-sm`; the four `--radius-*`; `--shadow-cell: 0 2px 6px rgb(20 32 43
/ 0.08)`, `--shadow-cell-lit: 0 6px 16px rgb(11 122 117 / 0.35)`, `--shadow-overlay:
0 24px 60px rgb(20 32 43 / 0.28)`; `--font-sans: var(--font-line-seed), "Noto Sans
Thai", Thonburi, system-ui, sans-serif`.
  7. `body { background: var(--b9-page); color: var(--b9-fg) }`, a global
     `:focus-visible { outline: 3px solid var(--b9-focus, var(--b9-primary)); outline-offset: 2px }`,
     and the existing `prefers-reduced-motion` block.

- [ ] **Step 6:** Check the utilities exist: add a scratch element using `bg-page text-fg
text-title min-h-control rounded-control shadow-cell` to `src/app/page.tsx`, run
      `pnpm build`, and confirm each class has a rule in `.next/static/**/*.css`. If a theme
      namespace does not generate one (for example `min-h-control`), declare it with
      `@utility` in `globals.css`. Remove the scratch element.
- [ ] **Step 7:** In `layout.tsx` remove the 800-weight font entry and delete the `XBd`
      font file. Keep `themeColor`, changing it to `"#FFFFFF"`.
- [ ] **Step 8:** Run `pnpm test`. Expected: token and contrast tests PASS.
- [ ] **Step 9: Commit** `feat(infra): replace design tokens and add elder and admin scopes`

### Task 3: Shared controls

**Files:** Create `Button`, `TextField` (rewrite), `Textarea`, `NumberField`, `Select`,
`Checkbox` + tests. Modify `index.ts`.

**Interfaces — Produces:**

```ts
type ButtonProps = (
  ButtonHTMLAttributes<HTMLButtonElement> | AnchorHTMLAttributes<HTMLAnchorElement>
) & {
  variant?: "primary" | "secondary" | "quiet" | "danger"; // default "primary"
  size?: "default" | "sm";
  fullWidth?: boolean;
  iconOnly?: boolean; // square; requires aria-label
  href?: string; // renders next/link <Link>
};
type FieldBase = { label: string; name: string; hint?: string; errors?: string[] };
type TextFieldProps = FieldBase & InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = FieldBase & TextareaHTMLAttributes<HTMLTextAreaElement>;
type NumberFieldProps = FieldBase & InputHTMLAttributes<HTMLInputElement> & { unit?: string };
type SelectProps = FieldBase &
  SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] };
type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & { label: string; name: string };
```

Decisions the tests pin:

- `Button`: `min-h-control` (or `min-h-control-sm`), `rounded-control`, `font-bold`,
  `text-lead` in default size and `text-body` in `sm`; primary `bg-primary
text-on-primary`, secondary `bg-surface border border-line-strong text-fg`, quiet
  transparent `text-fg-2`, danger `bg-danger text-white`; `type="button"` unless given;
  label may wrap (no `whitespace-nowrap`) so large text never clips.
- Fields: `<label for>` above the control; `id` defaults to `field-<name>`; error state
  sets `aria-invalid="true"`, `aria-describedby="<id>-error"`, `border-danger`, and
  renders `<p role="alert">` starting with `✕ ` followed by the messages; hint is hidden
  while an error shows. `NumberField` uses `inputMode="decimal"` and renders the unit in
  a suffix span inside the bordered box. `Select` is a native `<select>`.

- [ ] **Step 1: Write failing tests** (one file per component). Required assertions:

```tsx
// Button
expect(html(<Button>บันทึก</Button>)).toMatch(/<button[^>]*type="button"/);
expect(html(<Button variant="danger">ลบ</Button>)).toContain("bg-danger");
expect(html(<Button size="sm">x</Button>)).toContain("min-h-control-sm");
expect(html(<Button href="/home">ไป</Button>)).toMatch(/<a[^>]*href="\/home"/);
expect(html(<Button>ป้ายยาว</Button>)).not.toContain("whitespace-nowrap");
// TextField
const out = html(<TextField label="ชื่อคอร์ส" name="title" errors={["กรุณากรอก"]} hint="h" />);
expect(out).toContain('for="field-title"');
expect(out).toContain('aria-invalid="true"');
expect(out).toContain('role="alert"');
expect(out).toContain("✕ กรุณากรอก");
expect(out).not.toContain(">h<");
// NumberField
expect(html(<NumberField label="เวลา" name="ms" unit="มิลลิวินาที" />)).toContain("มิลลิวินาที");
expect(html(<NumberField label="เวลา" name="ms" />)).toContain('inputMode="decimal"');
// Select
expect(
  html(<Select label="ระดับ" name="lv" options={[{ value: "1", label: "ระดับ 1" }]} />),
).toContain('<option value="1">ระดับ 1</option>');
// Checkbox
expect(html(<Checkbox label="ยอมรับ" name="ok" />)).toMatch(/<input[^>]*type="checkbox"/);
```

- [ ] **Step 2:** Run. Expected: FAIL. **Step 3:** Implement. **Step 4:** Run. Expected: PASS.
- [ ] **Step 5: Commit** `feat(infra): add shared form controls and the new Button`

### Task 4: Shared feedback components

**Files:** Create `Notice`, `EmptyState`, `ConfirmDialog`, `Toast`; rewrite `ComingSoon`;
tests; `index.ts`.

**Interfaces — Produces:**

```ts
type Tone = "primary" | "success" | "danger" | "attention";
type NoticeProps = { tone: Tone; title?: string; children: ReactNode };
type EmptyStateProps = { title: string; description?: string; action?: ReactNode };
type ConfirmDialogProps = {
  // "use client", native <dialog>
  open: boolean;
  title: string;
  children: ReactNode; // children = consequences
  confirmLabel: string;
  cancelLabel?: string; // default "ยกเลิก"
  tone?: "primary" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
};
type ToastProps = { message: string; tone?: "success" | "danger" }; // presentational
type ComingSoonProps = { title: string; owner: string }; // unchanged API
```

Decisions: `Notice` always renders an icon — `Check` for success, `X` for danger,
`TriangleAlert` for attention, `Info` for primary — and uses `role="alert"` for danger,
`role="status"` otherwise. `ConfirmDialog` calls `showModal()` / `close()` in an effect on
`open`, maps the dialog `cancel` event (Escape) to `onCancel`, puts the cancel button
first and focuses it by default, uses `rounded-dialog shadow-overlay`. `Toast` is
`bg-ink text-white`, `role="status"`.

- [ ] **Step 1: Failing tests**

```tsx
expect(html(<Notice tone="success">บันทึกแล้ว</Notice>)).toContain("<svg");
expect(html(<Notice tone="danger">ผิดพลาด</Notice>)).toContain('role="alert"');
expect(html(<Notice tone="primary">x</Notice>)).toContain('role="status"');
const d = html(
  <ConfirmDialog
    open
    title="ระงับบัญชี?"
    confirmLabel="ระงับบัญชี"
    tone="danger"
    onConfirm={() => {}}
    onCancel={() => {}}
  >
    ผลที่จะเกิด
  </ConfirmDialog>,
);
expect(d).toContain("<dialog");
expect(d).toContain("ระงับบัญชี?");
expect(d.indexOf("ยกเลิก")).toBeLessThan(d.lastIndexOf("ระงับบัญชี"));
expect(d).toContain("bg-danger");
expect(html(<Toast message="บันทึกแล้ว" />)).toContain('role="status"');
expect(html(<EmptyState title="ยังไม่มีคอร์ส" />)).toContain("ยังไม่มีคอร์ส");
```

- [ ] **Step 2–4:** Run (FAIL) → implement → run (PASS).
- [ ] **Step 5: Commit** `feat(infra): add notice, dialog, toast and empty-state components`

### Task 5: Move existing code onto the new tokens and open PR 1

**Files:**

- Delete: `src/shared/ui/Card.tsx`
- Modify: `src/shared/ui/index.ts`, `src/app/page.tsx`, `src/app/admin/page.tsx`,
  `src/app/admin/layout.tsx`, `src/app/(elder)/layout.tsx`,
  `src/app/admin/content/courses/page.tsx`, `src/modules/content/ui/CourseList.tsx`,
  `src/modules/content/ui/CreateCourseForm.tsx`

**Interfaces:** Consumes the utilities from Task 2 and the components from Tasks 3–4.

- [ ] **Step 1:** `grep -rnE "text-text|border-border|rounded-card|shadow-card|surface-2|bg-bg\b|font-extrabold|Card\b" src --include='*.tsx'` and list every hit.
- [ ] **Step 2:** Replace each hit: colours and radii with the Task 2 names;
      `font-extrabold` → `font-bold`; `Card` → a plain element with `border-b border-line`
      spacing on the elderly side and `rounded-panel border border-line bg-surface` on the
      admin side. `(elder)/layout.tsx` root gets `data-ui="elder"`; `admin/layout.tsx` root
      gets `data-ui="admin"`; `src/app/page.tsx` wraps its content in `data-ui="elder"`.
      `CreateCourseForm` uses `TextField`, `Textarea` (description), `Select` (difficulty)
      and the new `Button`; its status messages become `Notice`.
- [ ] **Step 3:** Re-run the grep from Step 1. Expected: no output.
- [ ] **Step 4:** `pnpm check && pnpm build`. Expected: both pass.
- [ ] **Step 5: Browser check.** `pnpm dev`, open `/`, `/admin`, `/admin/content/courses`.
      Expected: teal buttons, LINE Seed font, no unstyled (black-on-white default) controls;
      creating a course still works and shows the success notice.
- [ ] **Step 6: Commit** `refactor(infra): move existing screens to the new tokens and drop Card`
- [ ] **Step 7:** Push and open PR 1 into `staging`, title
      `feat(infra): design system foundations`. Stop until the lead merges it.

---

# PR 2 — Elderly kit (branch `feat/infra-ds-elder` from updated `staging`)

### Task 6: Elderly structure components

**Files:** Create `ElderHeader`, `Section`, `ListRow`, `Badge` + tests; `index.ts`.

```ts
type ElderHeaderProps = {
  title?: string;
  greeting?: string;
  name?: string; // title OR greeting+name
  backHref?: string;
  action?: ReactNode;
};
type SectionProps = {
  eyebrow?: string;
  title?: string;
  action?: ReactNode;
  first?: boolean;
  children: ReactNode;
};
type ListRowProps = {
  href: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  badge?: ReactNode;
};
type BadgeProps = {
  tone?: "neutral" | "primary" | "success" | "danger" | "attention";
  children: ReactNode;
};
```

Decisions: `ElderHeader` back control is a link with the visible text `ย้อนกลับ` and a
`ChevronLeft` icon. `Section` renders `border-t border-line pt-6 mt-6` unless `first`.
`ListRow` is a `next/link` with `min-h-[64px]`-equivalent via `min-h-control`, a
`ChevronRight` at the end, `border-b border-line`. `Badge` is a pill (`rounded-full`);
tone `success` always prepends a `Check` icon and `danger` an `X` icon.

- [ ] **Step 1: Failing tests**

```tsx
expect(html(<ElderHeader title="คอร์ส" backHref="/home" />)).toContain("ย้อนกลับ");
expect(html(<ElderHeader greeting="สวัสดีตอนเช้า" name="คุณสมศรี" />)).toContain("คุณสมศรี");
expect(html(<Section title="สัปดาห์นี้">x</Section>)).toContain("border-t");
expect(
  html(
    <Section first title="t">
      x
    </Section>,
  ),
).not.toContain("border-t");
expect(html(<ListRow href="/results" title="ผลลัพธ์ของฉัน" subtitle="s" />)).toMatch(
  /<a[^>]*href="\/results"/,
);
expect(html(<Badge tone="success">ทำครบแล้ว</Badge>)).toContain("<svg");
expect(html(<Badge tone="danger">ผิด</Badge>)).toContain("<svg");
expect(html(<Badge>ยังไม่เริ่ม</Badge>)).not.toContain("<svg");
```

- [ ] **Step 2–4:** FAIL → implement → PASS. **Step 5: Commit**
      `feat(infra): add elderly header, section, list row and badge`

### Task 7: Elderly flow components

**Files:** Create `ChoiceList`, `StepProgress`, `Meter`, `ResultBanner`, `PinPad` + tests.

```ts
type ChoiceListProps = {
  name: string;
  legend: string;
  defaultValue?: string;
  options: {
    value: string;
    title: string;
    description?: string;
    badge?: ReactNode;
    disabled?: boolean;
  }[];
};
function stepLabel(current: number, total: number): string; // exported from StepProgress.tsx
type StepProgressProps = { current: number; total: number };
type MeterProps = {
  label: string;
  value: number;
  max: number;
  valueText: string;
  segments?: boolean;
};
type ResultBannerProps = { tone: "success" | "danger"; title: string; detail?: string };
type PinPadProps = {
  length: 4 | 6;
  filled: number; // "use client"
  onDigit: (digit: string) => void;
  onDelete: () => void;
};
```

Decisions: `ChoiceList` is a `<fieldset>` with visually hidden native radios inside
labels; the checked option gets `bg-primary-soft` and a `Check` mark (CSS `:has(:checked)`
/ `peer-checked`, no JavaScript). `stepLabel` clamps `current` into `1..total` and
returns `ขั้นที่ X จาก Y`; with `total < 1` it returns an empty string. `Meter` renders
`role="meter"` with `aria-valuenow/min/max` and the `valueText` visibly. `ResultBanner`
renders a round icon badge (`Check` / `X`), the title as text, and `role="status"`.
`PinPad` renders digits 1–9, an empty slot, 0 and a delete key labelled `ลบ`; each key is
a `<button>` at least 64px tall; the dots show `filled` of `length` with an
`aria-label` of `ใส่แล้ว X จาก Y หลัก`.

- [ ] **Step 1: Failing tests**

```tsx
expect(stepLabel(2, 3)).toBe("ขั้นที่ 2 จาก 3");
expect(stepLabel(9, 3)).toBe("ขั้นที่ 3 จาก 3");
expect(stepLabel(0, 3)).toBe("ขั้นที่ 1 จาก 3");
expect(stepLabel(1, 0)).toBe("");
const c = html(
  <ChoiceList
    name="mode"
    legend="เลือกโหมด"
    defaultValue="test"
    options={[
      { value: "train", title: "โหมดฝึก" },
      { value: "test", title: "โหมดทดสอบ" },
    ]}
  />,
);
expect(c).toContain("<fieldset");
expect(c).toContain("<legend");
expect(c).toMatch(/value="test"[^>]*checked/);
expect(html(<Meter label="สัปดาห์นี้" value={3} max={5} valueText="ฝึกแล้ว 3 จาก 5 วัน" />)).toContain(
  'aria-valuenow="3"',
);
const r = html(<ResultBanner tone="success" title="ถูกต้อง เก่งมาก" />);
expect(r).toContain("<svg");
expect(r).toContain("ถูกต้อง เก่งมาก");
const p = html(<PinPad length={4} filled={2} onDigit={() => {}} onDelete={() => {}} />);
expect((p.match(/<button/g) ?? []).length).toBe(11);
expect(p).toContain("ใส่แล้ว 2 จาก 4 หลัก");
expect(p).toContain("ลบ");
```

- [ ] **Step 2–4:** FAIL → implement → PASS. **Step 5: Commit**
      `feat(infra): add choice list, step progress, meter, result banner and PIN pad`

### Task 8: Display settings (text size and high contrast)

**Files:** Create `src/shared/lib/display-settings.ts` + test, `src/shared/ui/DisplaySettings.tsx`

- test. Modify `src/app/layout.tsx`.

```ts
type DisplayPrefs = { size: 1 | 2 | 3; contrast: "normal" | "high" };
const DISPLAY_PREFS_KEY = "brain9.display";
const DEFAULT_DISPLAY_PREFS: DisplayPrefs; // { size: 1, contrast: "normal" }
function parseDisplayPrefs(raw: string | null): DisplayPrefs; // never throws
function serializeDisplayPrefs(prefs: DisplayPrefs): string;
function applyDisplayPrefs(prefs: DisplayPrefs, root: { dataset: DOMStringMap }): void;
// component DisplaySettings: "use client"; props { triggerLabel?: string } default "ก ขนาดตัวอักษร"
```

- [ ] **Step 1: Failing tests**

```ts
expect(parseDisplayPrefs(null)).toEqual({ size: 1, contrast: "normal" });
expect(parseDisplayPrefs("not json")).toEqual({ size: 1, contrast: "normal" });
expect(parseDisplayPrefs('{"size":9,"contrast":"x"}')).toEqual({ size: 1, contrast: "normal" });
expect(parseDisplayPrefs('{"size":3,"contrast":"high"}')).toEqual({ size: 3, contrast: "high" });
expect(parseDisplayPrefs(serializeDisplayPrefs({ size: 2, contrast: "high" }))).toEqual({
  size: 2,
  contrast: "high",
});
const root = { dataset: {} as DOMStringMap };
applyDisplayPrefs({ size: 2, contrast: "high" }, root);
expect(root.dataset).toEqual({ size: "2", contrast: "high" });
applyDisplayPrefs({ size: 1, contrast: "normal" }, root);
expect(root.dataset.contrast).toBeUndefined(); // "normal" removes the attribute
```

```tsx
const out = html(<DisplaySettings />);
expect(out).toContain("ก ขนาดตัวอักษร");
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement the lib. Implement the component: a ghost pill button that
      opens a native `<dialog>` with a three-option size `ChoiceList`-style group (`ปกติ`,
      `ใหญ่`, `ใหญ่มาก`), a high-contrast switch (`สีตัดกันสูง`) and a close button (`เสร็จ`).
      All `localStorage` reads and writes are wrapped in `try/catch`.
- [ ] **Step 4:** Read `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md`
      and apply its recommended pattern in `layout.tsx` so `data-size` / `data-contrast` are
      set from `localStorage` before first paint.
- [ ] **Step 5:** Run tests (PASS). `pnpm build` (PASS).
- [ ] **Step 6: Commit** `feat(infra): add display settings with persisted text size and contrast`

### Task 9: Tab bar, elderly layouts, home page; open PR 2

**Files:** Create `src/shared/ui/TabBar.tsx` + test, `src/shared/lib/nav.ts` + test,
`src/app/(auth)/layout.tsx`, `src/app/(elder)/home/page.tsx`. Modify
`src/app/(elder)/layout.tsx`, `src/app/page.tsx`.

```ts
function isActivePath(pathname: string, href: string): boolean; // exact, or a child segment
type TabBarItem = { href: string; label: string; icon: ReactNode };
type TabBarProps = { items: TabBarItem[]; hideOn?: string[] }; // "use client" (usePathname)
```

Decisions: tabs are `หน้าหลัก /home` (`House`), `คอร์ส /courses` (`LayoutGrid`),
`ผลลัพธ์ /results` (`ChartNoAxesColumn`), `จองคิว /booking` (`CalendarDays`). The layout
passes `hideOn={["/play"]}`. Active tab: `aria-current="page"`, `text-primary`, icon on a
`bg-primary-soft` pill. `(elder)/layout.tsx`: `data-ui="elder"`, a centred column
`max-w-[640px]`, `bg-surface`, `min-h-dvh`, content padding 20px, `TabBar` fixed to the
bottom with bottom padding on the content equal to the bar height. `(auth)/layout.tsx`:
the same column without the tab bar. `home/page.tsx` follows spec §6.1 with static
placeholder content (`ElderHeader` greeting with `DisplaySettings` as the action, a
`Section` with eyebrow `แบบฝึกวันนี้` and a `Button` to `/courses`, a `Meter`, and
`ListRow`s to `/results`, `/booking`, `/profile`). `src/app/page.tsx` becomes
`redirect("/home")`.

- [ ] **Step 1: Failing tests**

```ts
expect(isActivePath("/courses", "/courses")).toBe(true);
expect(isActivePath("/courses/abc", "/courses")).toBe(true);
expect(isActivePath("/coursesx", "/courses")).toBe(false);
expect(isActivePath("/home", "/courses")).toBe(false);
expect(isActivePath("/admin/users", "/admin")).toBe(false); // "/admin" is active only on exact match
```

Rule: true when `pathname === href`; also true when `pathname` starts with `href + "/"`,
except for the hrefs `/` and `/admin`, which match exactly only.

```tsx
const t = html(
  <TabBar
    items={[
      { href: "/home", label: "หน้าหลัก", icon: <i /> },
      { href: "/courses", label: "คอร์ส", icon: <i /> },
    ]}
  />,
);
expect((t.match(/<a /g) ?? []).length).toBe(2);
expect(t).toContain("หน้าหลัก");
expect(t).toContain("<nav");
```

(`usePathname` returns `null` outside a router; `TabBar` must tolerate that.)

- [ ] **Step 2–3:** FAIL → implement `isActivePath`, `TabBar`, layouts, home page, redirect.
- [ ] **Step 4:** `pnpm check && pnpm build`. Expected: PASS; `/home` is prerendered.
- [ ] **Step 5: Browser check (Review Focus 2).** At 360×740: open `/home`, `/courses`,
      `/login`; open the display settings, choose `ใหญ่มาก` and `สีตัดกันสูง`. Expected: no
      horizontal scroll (`document.documentElement.scrollWidth === clientWidth`), no clipped
      button or tab label, tab bar visible on `/home` and absent on `/login`; reload keeps the
      settings without a flash; `/admin` is unaffected by both settings.
- [ ] **Step 6: Commit** `feat(infra): add the elderly shell, tab bar and home screen`
- [ ] **Step 7:** Push, open PR 2 `feat(infra): elderly design-system kit`. Stop until merged.

---

# PR 3 — Admin kit (branch `feat/infra-ds-admin` from updated `staging`)

### Task 10: Admin data components

**Files:** Create `Panel`, `DataTable`, `Pagination`, `StatusDot`, `Tag`, `Tabs` + tests;
`src/shared/lib/pagination.ts` + test.

```ts
function pageRange(
  page: number,
  pageSize: number,
  total: number,
): { page: number; from: number; to: number; pageCount: number };
function pageItems(page: number, pageCount: number): (number | "ellipsis")[];
type PanelProps = {
  title?: string;
  count?: string;
  action?: ReactNode;
  padded?: boolean;
  children: ReactNode;
};
// DataTable.tsx exports: Table, THead, TBody, Tr, Th, Td
type ThProps = ThHTMLAttributes<HTMLTableCellElement> & {
  numeric?: boolean;
  sort?: "asc" | "desc" | "none";
};
type TdProps = TdHTMLAttributes<HTMLTableCellElement> & {
  numeric?: boolean;
  primary?: boolean;
  muted?: boolean;
};
type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  hrefFor: (page: number) => string;
};
type StatusDotProps = { tone: "ok" | "draft" | "off" | "danger"; children: ReactNode };
type TagProps = {
  tone?: "neutral" | "attention" | "primary";
  icon?: ReactNode;
  children: ReactNode;
};
type TabsProps = { items: { href: string; label: string; count?: number; active?: boolean }[] };
```

Decisions: `pageRange` clamps `page` into `1..pageCount`; with `total === 0` it returns
`{ page: 1, from: 0, to: 0, pageCount: 0 }`. `pageItems` shows at most 7 entries: first,
last, the current page and its neighbours, with `"ellipsis"` between gaps.
`Pagination` text: `แสดง {from}–{to} จาก {total} รายการ`, or `ไม่มีรายการ` when total is 0;
previous/next are links with `aria-label` `หน้าก่อนหน้า` / `หน้าถัดไป`, rendered as
disabled spans at the ends. `Th` with `sort` sets `aria-sort` (`ascending` /
`descending` / `none`); `numeric` adds `text-right tabular-nums`. `Td primary` is
`font-bold`. `StatusDot`: an 8px dot plus the text — `ok` `bg-success`, `draft` hollow
`border-attention`, `off` `bg-line-strong` with `text-fg-muted`, `danger` `bg-danger`.
`Tabs` renders links in a `<nav>`; the active one has `aria-current="page"` and a 2px
`border-primary` underline; `count` renders in a small pill. `Panel`: `rounded-panel
border border-line bg-surface`, header row only when `title` or `action` is given.

- [ ] **Step 1: Failing tests**

```ts
expect(pageRange(1, 20, 128)).toEqual({ page: 1, from: 1, to: 20, pageCount: 7 });
expect(pageRange(7, 20, 128)).toEqual({ page: 7, from: 121, to: 128, pageCount: 7 });
expect(pageRange(99, 20, 128).page).toBe(7);
expect(pageRange(0, 20, 128).page).toBe(1);
expect(pageRange(1, 20, 0)).toEqual({ page: 1, from: 0, to: 0, pageCount: 0 });
expect(pageRange(1, 20, 4)).toEqual({ page: 1, from: 1, to: 4, pageCount: 1 });
expect(pageItems(1, 7)).toEqual([1, 2, "ellipsis", 7]);
expect(pageItems(4, 7)).toEqual([1, "ellipsis", 3, 4, 5, "ellipsis", 7]);
expect(pageItems(1, 1)).toEqual([1]);
expect(pageItems(1, 0)).toEqual([]);
```

```tsx
expect(
  html(<Pagination page={1} pageSize={20} total={0} hrefFor={(p) => `?page=${p}`} />),
).toContain("ไม่มีรายการ");
expect(
  html(<Pagination page={1} pageSize={20} total={128} hrefFor={(p) => `?page=${p}`} />),
).toContain("แสดง 1–20 จาก 128 รายการ");
expect(html(<Th sort="asc">ชื่อ</Th>)).toContain('aria-sort="ascending"');
expect(html(<Td numeric>3</Td>)).toContain("tabular-nums");
expect(html(<StatusDot tone="ok">เปิดใช้งาน</StatusDot>)).toContain("เปิดใช้งาน");
expect(html(<Tag tone="attention">สองนิ้วพร้อมกัน</Tag>)).toContain("สองนิ้วพร้อมกัน");
expect(
  html(<Tabs items={[{ href: "?s=all", label: "ทั้งหมด", count: 4, active: true }]} />),
).toContain('aria-current="page"');
expect(html(<Panel title="คอร์ส">x</Panel>)).toContain("rounded-panel");
```

- [ ] **Step 2–4:** FAIL → implement → PASS. **Step 5: Commit**
      `feat(infra): add admin panel, table, pagination, status and tabs`

### Task 11: Admin page furniture

**Files:** Create `PageHeader`, `StatTile`, `SegmentedControl`, `SaveBar` + tests.

```ts
type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
};
type StatTileProps = {
  icon: ReactNode;
  label: string;
  value: string;
  unit?: string;
  delta?: { text: string; tone: "up" | "flat" | "warn" };
};
type SegmentedControlProps = {
  name: string;
  legend: string;
  defaultValue: string;
  options: { value: string; label: string; icon?: ReactNode }[];
};
type SaveBarProps = { dirty: boolean; children: ReactNode }; // children = the buttons
```

Decisions: `PageHeader` renders the breadcrumb in a `<nav aria-label="เส้นทาง">` with the
last item as plain bold text, then an `<h1 class="text-title font-bold">`.
`SegmentedControl` is a `<fieldset>` of native radios (no JavaScript), legend visually
hidden. `SaveBar` shows `มีการแก้ไขที่ยังไม่บันทึก` with an `attention` dot only when
`dirty`, `sticky bottom-0 border-t border-line bg-surface`. `StatTile` icon tile is 44px,
`rounded-[10px]`-equivalent via `rounded-panel`, `bg-primary-soft text-primary` (`warn`
delta switches the tile to `attention` tones); value uses `tabular-nums`.

- [ ] **Step 1: Failing tests**

```tsx
const h = html(
  <PageHeader title="ผู้ใช้งาน" breadcrumbs={[{ label: "ผู้ใช้และศูนย์" }, { label: "ผู้ใช้งาน" }]} />,
);
expect(h).toMatch(/<h1[^>]*>ผู้ใช้งาน<\/h1>/);
expect(h).toContain('aria-label="เส้นทาง"');
expect(html(<SaveBar dirty>x</SaveBar>)).toContain("มีการแก้ไขที่ยังไม่บันทึก");
expect(html(<SaveBar dirty={false}>x</SaveBar>)).not.toContain("มีการแก้ไขที่ยังไม่บันทึก");
expect(html(<StatTile icon={<i />} label="ผู้ฝึก" value="42" unit="คน" />)).toContain("tabular-nums");
expect(
  html(
    <SegmentedControl
      name="m"
      legend="วิธีกด"
      defaultValue="one"
      options={[
        { value: "one", label: "ทีละช่อง" },
        { value: "duo", label: "สองนิ้วพร้อมกัน" },
      ]}
    />,
  ),
).toMatch(/value="one"[^>]*checked/);
```

- [ ] **Step 2–4:** FAIL → implement → PASS. **Step 5: Commit**
      `feat(infra): add admin page header, stat tile, segmented control and save bar`

### Task 12: Admin shell

**Files:** Create `src/shared/ui/AdminShell.tsx` + test, `src/app/admin/nav.ts`. Modify
`src/app/admin/layout.tsx`.

```ts
type AdminNavItem = { href: string; label: string; icon: ReactNode; badge?: string };
type AdminNavGroup = { label?: string; items: AdminNavItem[] };
type AdminShellProps = {
  // "use client" (collapse state, usePathname)
  brand: string;
  roleLabel: string;
  nav: AdminNavGroup[];
  user?: ReactNode;
  centerSlot?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
};
// src/app/admin/nav.ts
export const adminNav: AdminNavGroup[];
```

Decisions: `adminNav` is exactly — ungrouped `ภาพรวม /admin` (`LayoutDashboard`);
`ผู้ใช้และศูนย์`: `ผู้ใช้งาน /admin/users` (`Users`), `ศูนย์และเครื่อง /admin/centers`
(`Building2`), `คำขอข้อมูลส่วนบุคคล /admin/privacy` (`ShieldCheck`); `การจอง`:
`ตารางเวลา /admin/schedule` (`Clock`), `รายการจอง /admin/bookings` (`CalendarDays`);
`เนื้อหาและผล`: `คอร์สและแบบฝึก /admin/content/courses` (`BookOpen`), `วิเคราะห์ผล
/admin/analytics` (`ChartLine`). The file's header comment says a lane changes its own
lines only, through a PR the lead approves. Shell: `<aside>` 240px on `bg-ink`, brand row
56px with a 28px `bg-primary` mark showing `9`; group labels 11.5px bold; item active
state per spec §6.2 with `aria-current="page"` (uses `isActivePath`); a collapse button
`ย่อเมนู` that toggles a 64px icon-only rail (labels become `title` + `aria-label`); top
bar 56px with the toggle (`aria-label="เปิดหรือปิดเมนู"`), then `centerSlot`, a help link,
and `user`. No search box and no notification bell are rendered. Below 1024px the menu
starts collapsed. `footer` defaults to `Brain9 ระบบฝึกสมองผู้สูงอายุ`. The layout keeps
`AdminGate` inside `<Suspense>` and passes `user={<Suspense fallback={null}><AdminUser/></Suspense>}`
where `AdminUser` (in the layout file) awaits `getCurrentUser()` and renders the name and
the text `ผู้ดูแลระบบ`. No sign-out control is rendered until identity provides one.

- [ ] **Step 1: Failing test**

```tsx
const out = html(
  <AdminShell brand="Brain9" roleLabel="ผู้ดูแล" nav={adminNav}>
    เนื้อหา
  </AdminShell>,
);
expect(out).toContain("<aside");
expect(out).toContain("คอร์สและแบบฝึก");
expect(out).toContain("ผู้ใช้และศูนย์");
expect(out).toContain("ย่อเมนู");
expect(out).toContain('aria-label="เปิดหรือปิดเมนู"');
expect(out).not.toMatch(/type="search"/);
expect(adminNav.flatMap((g) => g.items).map((i) => i.href)).toEqual([
  "/admin",
  "/admin/users",
  "/admin/centers",
  "/admin/privacy",
  "/admin/schedule",
  "/admin/bookings",
  "/admin/content/courses",
  "/admin/analytics",
]);
```

(`usePathname` returns `null` outside a router; the shell must tolerate that.)

- [ ] **Step 2–3:** FAIL → implement shell, nav, layout.
- [ ] **Step 4:** `pnpm check && pnpm build` (PASS). Browser: `/admin/content/courses` at
      1440px and 900px — active item highlighted, collapse works with the keyboard, no
      horizontal scroll.
- [ ] **Step 5: Commit** `feat(infra): add the admin shell with grouped navigation`

### Task 13: Restyle the reference slice; open PR 3

**Files:** Modify `src/app/admin/content/courses/page.tsx`,
`src/modules/content/ui/CourseList.tsx`, `src/modules/content/ui/CreateCourseForm.tsx`,
`src/app/admin/page.tsx`.

Decisions: the page renders `PageHeader` (title `คอร์สและแบบฝึก`, breadcrumbs
`เนื้อหาและผล / คอร์สและแบบฝึก`), then a `Panel` containing `CourseList` in `<Suspense>`,
then a `Panel title="สร้างคอร์สใหม่"` with the form. `CourseList` becomes a `Table` with
columns `คอร์ส` (title bold + description muted), `ความยาก` (`ระดับ N`), `แบบฝึก`
(numeric), `สถานะ` (`StatusDot`: PUBLISHED → `ok` `เปิดใช้งาน`, DRAFT → `draft`
`ฉบับร่าง`, ARCHIVED → `off` `เก็บถาวร`); empty list → `EmptyState`. The comments that
mark this slice as the reference implementation stay. No data, action or contract change.

- [ ] **Step 1:** Make the changes. **Step 2:** `pnpm check && pnpm build` (PASS).
- [ ] **Step 3: Browser check.** With the seeded database, `/admin/content/courses` shows
      the seeded course in the table; create a course `ทดสอบดีไซน์`; it appears as `ฉบับร่าง`
      and the success notice shows; submitting an empty title shows `✕ กรุณากรอกชื่อคอร์ส`.
      Delete the test row from the dev database afterwards.
- [ ] **Step 4: Commit** `refactor(content): restyle the reference course screens on the admin kit`
- [ ] **Step 5:** Push, open PR 3 `feat(infra): admin design-system kit`. Stop until merged.

---

# PR 4 — Reference and enforcement (branch `feat/infra-ds-reference`)

### Task 14: The `/design` page

**Files:** Create `src/app/design/enabled.ts` + test, `src/app/design/page.tsx`,
`src/app/design/sections/*.tsx` (one file per section), `src/app/design/Example.tsx`.

```ts
function isDesignPageEnabled(appEnv: "local" | "staging" | "production"): boolean;
type ExampleProps = { title: string; importLine: string; children: ReactNode }; // shows the import line under the demo
```

- [ ] **Step 1: Failing test**

```ts
expect(isDesignPageEnabled("local")).toBe(true);
expect(isDesignPageEnabled("staging")).toBe(true);
expect(isDesignPageEnabled("production")).toBe(false);
```

- [ ] **Step 2:** Implement; `page.tsx` calls `notFound()` when disabled (read
      `env().APP_ENV`; no cookies, no database, so the page prerenders).
- [ ] **Step 3:** Build the sections, in this order: (1) colours — every token with its
      name, value and `contrastRatio` against its usual background; (2) type — both scales;
      (3) **elderly** part inside `data-ui="elder"`: every Task 3–4 and 6–9 component in each
      variant and state, the play-board reference from spec §8 (static `div`s: empty, shown,
      lit, tapped with number, correct, wrong), a high-contrast preview rendered inside a
      wrapper that carries the high-contrast variables, and the home screen example;
      (4) **admin** part inside `data-ui="admin"`: every Task 10–12 component, the editor-grid
      reference from spec §8, and a filled table example; (5) do / don't — six pairs taken
      from spec §2 anti-goals.
- [ ] **Step 4:** `pnpm check && pnpm build` (PASS; `/design` listed as static).
- [ ] **Step 5: Browser check.** `/design` renders every section without console errors
      at 1440px and 390px. Then `APP_ENV=production pnpm build && APP_ENV=production pnpm start --port 3010`
      and `curl -s -o /dev/null -w "%{http_code}" localhost:3010/design`. Expected: `404`.
      Stop the server and run a normal `pnpm build` again.
- [ ] **Step 6: Commit** `feat(infra): add the live design-system reference page`

### Task 15: Lint rule against raw colours and font sizes

**Files:** Modify `eslint.config.mjs`. Create `src/shared/lib/design-lint.test.ts`.

Decisions: add one config object with `files: ["src/app/**", "src/modules/**"]`,
`ignores: ["src/app/design/**", "src/app/layout.tsx", "src/app/globals.css"]`, rule
`no-restricted-syntax` with two selectors (`Literal` and `TemplateElement`) matching
this pattern, and the message `Use design tokens and @/shared/ui (docs/design-system.md):
no raw colours or arbitrary colour/font-size values.`:

```
#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|\b(?:bg|text|border|fill|stroke|ring|outline|from|via|to|shadow|decoration|accent|caret|divide)-\[(?:#|rgb|hsl|oklch|color)|\btext-\[\d
```

- [ ] **Step 1: Failing test** using the `ESLint` class with the repo config
      (`new ESLint({ cwd: process.cwd() })`, `lintText(code, { filePath })`):

```ts
const bad = [
  '<p className="bg-[#fff]" />',
  '<p className="text-[19px]" />',
  'const c = "#0B7A75";',
  '<p className="border-[rgb(0,0,0)]" />',
];
// each, at filePath "src/modules/engine/ui/X.tsx", yields >= 1 message with ruleId "no-restricted-syntax"
const ok = ['<p className="bg-primary text-body max-w-[560px]" />', 'const t = "ข้อ #2";'];
// each, at the same path, yields 0 "no-restricted-syntax" messages
// '<p className="bg-[#fff]" />' at "src/shared/ui/X.tsx" and at "src/app/design/sections/X.tsx" yields 0
```

- [ ] **Step 2–3:** FAIL → add the rule. **Step 4:** `pnpm check` (PASS; if existing
      files trip the rule, fix them with tokens — do not widen the ignores).
- [ ] **Step 5: Commit** `feat(infra): lint against raw colours and font sizes in feature code`

### Task 16: Written rules; open PR 4

**Files:** Create `docs/design-system.md`. Modify `AGENTS.md`, `docs/ai/CHAT-CONTEXT.md`,
`docs/ownership.md`, `docs/superpowers/specs/2026-11-26-design-system-design.md` (status
line → `implemented`).

- [ ] **Step 1:** Write `docs/design-system.md` (target ≤ 250 lines) with these sections:
      _What this is_ · _Two scopes_ (table from spec §5.3) · _Colour tokens_ (name → use, the
      utility names from Task 2) · _Type_ · _Elderly screens_ (pattern from §6.1, components)
      · _Admin console_ (pattern from §6.2, components, how to add a menu item in
      `src/app/admin/nav.ts`) · _The 3x3 board_ (spec §8) · _Charts_ (use `--chart-1..4`) ·
      _Voice_ · _Do / Don't_ · _Where to look_ (`/design` on local and staging, mockups).
- [ ] **Step 2:** In `AGENTS.md` replace the paragraph that starts `**UI for elderly
users**` with exactly:

```markdown
**UI** — read [`docs/design-system.md`](docs/design-system.md) before building any screen,
and look at `/design` (local or staging) for live examples. Hard rules:

- Build with `@/shared/ui`. If a part is missing, open an `infra` issue; do not hand-roll it.
- No raw colours and no arbitrary colour or font-size values (`#0B7A75`, `bg-[#fff]`,
  `text-[19px]`). ESLint rejects them.
- Elderly screens (`(auth)`, `(elder)`): no cards, one primary button per screen, every
  icon has a text label, text never below 17.5px, targets at least 48px.
- Admin screens (`/admin`): inside `AdminShell`; tables in `Panel` + `DataTable`; status
  as `StatusDot`; one primary action per page in `PageHeader`.
- Correct and wrong always show ✓ / ✕ **and** words — never colour alone.
- Confirm anything irreversible with `ConfirmDialog`, stating what will happen.
```

- [ ] **Step 3:** In `AGENTS.md` §6 add `src/app/admin/nav.ts` and `src/app/design/**` to
      the hot files. In `docs/ownership.md` add the admin-menu line edit as an allowed
      one-line PR. In `docs/ai/CHAT-CONTEXT.md` replace the token examples with the Task 2
      names, replace the `Shared UI` line with the full component list grouped as in spec §7,
      and add the six hard rules above.
- [ ] **Step 4:** `pnpm format && pnpm check && pnpm build` (PASS).
- [ ] **Step 5: Commit** `docs(infra): document the design system and update AI rules`
- [ ] **Step 6:** Push, open PR 4 `feat(infra): design-system reference, lint rule and docs`.
