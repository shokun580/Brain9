# Brain9 design system — design

Date: 2026-11-26 · Owner: infra (team lead, Apinan) · Status: draft for approval

## 1. Intent

Four people build Brain9, each with their own AI assistant. Before any lane builds its
screens, the team needs **one shared look and one set of building blocks**, so that every
screen looks like the same product no matter who — or which AI — made it.

The current look comes from the `demov1` prototype (cream background, navy, very large
blocky controls). The lead's verdict: easy to use, but it **feels like a game and looks
dated**. The new look must stay easy for elderly users while looking **modern**, and the
admin side must look like a **professional back-office tool**, not a toy.

The design system is two things, delivered together:

1. **Rules** people and AIs can read (tokens, patterns, do/don't).
2. **Working parts** in `src/shared/ui` that already follow the rules, so the easy path
   for any AI is to reuse them instead of inventing CSS.

## 2. Goals, non-goals, anti-goals

**Goals**

- Elderly side: calm, modern, "health app" look — white surface, one teal accent,
  generous whitespace, almost no cards; large text and targets; meaning never carried by
  colour alone.
- Admin side: a professional console in the AdminLTE tradition (dark left menu, top bar,
  content in panels), modernised — flat, thin borders, small radii, restrained colour,
  dense but readable tables, built for all-day desktop use.
- One brand across both: same font, same colour tokens, same voice.
- One source of truth for colours, type, sizes and radii (`globals.css`), consumed only
  through Tailwind utilities and shared components.
- A live reference page (`/design`) showing every part on both sides.
- Rules short enough that an AI reads them before writing UI.

**Non-goals**

- Dark mode (the elderly high-contrast mode covers low-vision needs).
- Illustrations, mascots, decorative imagery.
- Designing each lane's flows; lanes design their own screens with these parts.
- A Figma library or Storybook.
- The behaviour of the 3x3 pattern grid (engine lane; see §8).
- Global search and notifications in the admin top bar: the approved mockups show them,
  but no lane owns those features. The shell reserves their place and does **not** render
  them until a lane implements them.

**Anti-goals** — the result fails if it:

- looks like a game: gradients, heavy drop shadows, glossy surfaces, bouncy animation,
  confetti, everything shaped like a pill;
- puts every elderly-side section in a bordered or shadowed card;
- makes the admin side look like the elderly side scaled down (oversized rounded
  controls, pastel pill badges, big bold everything);
- shrinks elderly text or targets to look "modern";
- uses colour as the only signal (correct/wrong, status, selection).

## 3. Decisions made with the lead (2026-11-25/26)

Decided over five rounds of mockups. The approved mockups are kept in
`docs/design-system/mockups/` and are the visual reference; when a mockup and this text
disagree on a value, **this text wins**, and when this text is silent, the mockup wins.

| Topic            | Decision                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| Starting point   | Redesign the look from scratch; keep only the font                                                     |
| Font             | LINE Seed Sans TH                                                                                      |
| Font weights     | 700 for emphasis and headings, 400 for body; no 800                                                    |
| Elderly layout   | Minimal, very few cards; sections separated by space and 1px lines                                     |
| 3x3 board shape  | Tinted board, white rounded cells with a soft shadow, lit cell in the accent colour                    |
| Primary colour   | Teal `#0B7A75`                                                                                         |
| "Correct" colour | Green `#1E7A3C`, always paired with ✓ and a word                                                       |
| Admin layout     | "Like AdminLTE but modern": dark left menu with groups, top bar, content in panels; approved as mocked |
| Delivery         | Rules document + working tokens and components in shared code                                          |

The lead was shown that the success green is close to the teal primary and chose it
anyway. The mitigation is a hard rule, not a colour change: a correct result always shows
the ✓ mark and the word "ถูกต้อง"; it is never a colour change alone.

The elderly-side full-screen mockups drew no objections; they are treated as approved.

## 4. Approaches considered

| Approach                                                       | Trade-off                                                                                       | Outcome                |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------- |
| 1. Document only (`docs/design-system.md`)                     | Fast; every AI re-implements CSS from prose, so screens drift apart                             | Rejected               |
| 2. Document + tokens + shared components + live `/design` page | More work up front; AIs reuse parts, so consistency is enforced by code                         | **Chosen by the lead** |
| 3. Off-the-shelf kit (e.g. shadcn/ui) re-themed                | Many parts at once; adds dependencies, defaults are small and generic and AIs tend to keep them | Rejected               |

## 5. Foundations (tokens)

All values live in `src/app/globals.css` as CSS custom properties, exposed to Tailwind 4
through `@theme inline`. Pages and module code use Tailwind utilities and shared
components — never hex values, `rgb()`, or arbitrary colour / font-size values such as
`bg-[#...]` or `text-[19px]`.

### 5.1 Colour (both sides)

| Token                          | Value                 | Use                                                                     |
| ------------------------------ | --------------------- | ----------------------------------------------------------------------- |
| `bg`                           | `#F5F7F8`             | Admin page background; elderly page background outside the phone column |
| `surface`                      | `#FFFFFF`             | Elderly screens, admin panels, inputs                                   |
| `surface-subtle`               | `#F8FAFB`             | Admin table headers, unit suffixes, quiet fills                         |
| `surface-muted`                | `#EEF2F4`             | Neutral badges, keypad keys, disabled                                   |
| `text`                         | `#14202B`             | Body and headings                                                       |
| `text-2`                       | `#3B4854`             | Admin secondary text, menu items                                        |
| `text-muted`                   | `#5A6873`             | Captions, helper text, inactive tabs                                    |
| `line`                         | `#E1E7EA`             | Dividers, panel borders                                                 |
| `line-strong`                  | `#C3CDD3`             | Input and outline-button borders                                        |
| `primary`                      | `#0B7A75`             | Primary buttons, active states, links, progress, lit cell, chart line   |
| `primary-press`                | `#08625E`             | Pressed / hover of primary; text on `primary-soft`                      |
| `primary-soft`                 | `#E3F2F0`             | Selected row, active tab pill, board background                         |
| `primary-tint`                 | `#BDE2DD`             | Already-shown cells                                                     |
| `primary-bright`               | `#4FD1C5`             | Accent on the dark admin menu only                                      |
| `on-primary`                   | `#FFFFFF`             | Text on primary                                                         |
| `success` / `success-soft`     | `#1E7A3C` / `#E4F3E8` | Correct, done, active — always with ✓ or a status word                  |
| `danger` / `danger-soft`       | `#B42318` / `#FDECEA` | Wrong, errors, destructive — always with ✕ or words                     |
| `attention` / `attention-soft` | `#9A5B00` / `#FFF1DC` | Two-finger cue, warnings, draft                                         |
| `ink`                          | `#122029`             | Admin menu background, toast background                                 |
| `focus`                        | `#0B7A75`             | Focus ring: 3px outline, 2px offset                                     |

Chart colours (analytics): series 1 `primary`; further series `#3B6FB6`, `#9A5B00`,
`#6B4FA8`; sequential scales use `primary` at 100 / 78 / 55 / 35% opacity. Charts read
these as CSS variables (`--chart-1` … `--chart-4`), never hard-coded hex.

All text/background pairs meet WCAG AA (≥ 4.5:1). White on `primary` ≈ 5.2:1.

### 5.2 High-contrast theme (elderly side only)

`<html data-contrast="high">`, user-selectable. Every token is redefined:

| Token                             | High-contrast value                           |
| --------------------------------- | --------------------------------------------- |
| `bg`, `surface`                   | `#000000`                                     |
| `surface-subtle`, `surface-muted` | `#1A1A1A`                                     |
| `text` / `text-2` / `text-muted`  | `#FFFFFF` / `#F0F0F0` / `#E6E6E6`             |
| `line`, `line-strong`             | `#FFFFFF`, borders become 2px                 |
| `primary` / `primary-press`       | `#5EEAD4` / `#2DD4BF`, `on-primary` `#000000` |
| `primary-soft` / `primary-tint`   | `#0B2E2A` / `#145C55`                         |
| `success` / `success-soft`        | `#5BE38A` / `#0B2A16`                         |
| `danger` / `danger-soft`          | `#FF8A7E` / `#300E0A`                         |
| `attention` / `attention-soft`    | `#FFD36E` / `#2B2000`                         |
| `focus`                           | `#FFFFFF`                                     |

Shadows are removed; badges gain a 1px border in their text colour. Board in high
contrast: board `#0B2E2A`, empty cell `#000000` with a 2px white border, shown cell
`#145C55`, lit cell `#5EEAD4`, correct `#5BE38A` and wrong `#FF8A7E` with black marks.

### 5.3 Two scopes: `elder` and `admin`

Layouts set `data-ui="elder"` or `data-ui="admin"` on their root element. The scope
defines the type scale and control sizes as CSS variables; **shared components read those
variables and never check the scope themselves**. The root font size stays 16px so
Tailwind's spacing scale keeps its normal pixel values.

| Variable                               | `elder`               | `admin`                       |
| -------------------------------------- | --------------------- | ----------------------------- |
| `--text-title`                         | 35px / 700            | 22px / 700                    |
| `--text-heading`                       | 27px / 700            | 17px / 700                    |
| `--text-lead`                          | 22px / 700            | 15.5px / 700                  |
| `--text-body`                          | 20px / 400            | 14.5px / 400                  |
| `--text-small`                         | 17.5px / 400          | 13px / 400                    |
| `--text-micro`                         | — (not used)          | 12.5px (table headers, hints) |
| `--control-h` (default button / input) | 64px                  | 36px                          |
| `--control-h-sm`                       | 48px                  | 30px                          |
| `--radius-control`                     | 18px (inputs 14px)    | 8px                           |
| `--radius-panel`                       | 26px (board, dialogs) | 10px (panels), 12px (dialogs) |
| Minimum tappable size                  | 48×48px, 8px apart    | 30px                          |

Minimum text size: 17.5px on the elderly side, 12.5px on the admin side.

**Text-size control (elderly only):** `<html data-size="1|2|3">` multiplies the `elder`
text variables by 1 / 1.2 / 1.4. Controls use `min-height`, so they grow with their
text; nothing else scales. The admin scope ignores `data-size` and `data-contrast`.

Line-height: body 1.6, headings 1.3 (Thai vowels and tone marks need the room).
One title per screen. Emphasis by weight or `primary` colour, not underline or italics
(links are the exception: underlined on the elderly side).

### 5.4 Spacing and elevation

- **Elderly:** screen padding 20px; between sections 24px + a 1px line; inside a section
  12–16px. No shadows on page content. Only dialogs, the toast and the board cells cast a
  shadow (cell `0 2px 6px rgb(20 32 43 / .08)`; lit cell `0 6px 16px` primary at 35%).
- **Admin:** content padding 24px; 16px between panels; panel padding 16–18px; table
  cells 9px × 14px. Panels have a 1px `line` border and no shadow. Only dialogs and the
  toast cast a shadow.

### 5.5 Icons

Outline icons from **lucide-react** (new dependency, approved by the lead in this
design), stroke 1.8–1.9px; 22–26px on the elderly side, 16–20px on the admin side.
On the elderly side an icon never appears without a visible text label, except the
chevron at the end of a list row. Admin icon-only buttons carry an `aria-label` and a
tooltip.

### 5.6 Motion

150–200ms ease-out for state changes; no bounce, spring or confetti. Everything respects
`prefers-reduced-motion`. Pattern timing on the board belongs to the engine lane.

## 6. Layout patterns

### 6.1 Elderly screen (phone first, 360–430px; centred column up to 640px on tablets)

```
header      greeting / title + one pill-shaped ghost button ("ก ขนาดตัวอักษร", "ออก", "ย้อนกลับ")
section     eyebrow (primary, small, 700) · title · meta · full-width primary button
  ─────     1px line
section     label + value row · progress
  ─────
list        rows: icon · title + subtitle · chevron, separated by 1px lines
tab bar     หน้าหลัก · คอร์ส · ผลลัพธ์ · จองคิว — icon + label, active = primary + soft pill
```

- No cards. A section is space plus an optional top line; a list is rows with lines.
- One primary button per screen. Secondary actions are outline buttons or list rows.
- Multi-step flows show "ขั้นที่ X จาก Y" with a segmented progress.
- Anything irreversible goes through the confirm dialog.
- Result screens: a round icon badge, a heading in words, one line of detail, then the
  board and one primary action.

### 6.2 Admin console (desktop first, usable down to tablet width)

```
┌──────────┬──────────────────────────────────────────────────────────┐
│ Brain9   │ [≡]                              ศูนย์ ▾   (?)   user ▾  │  top bar 56px
│ ──────── ├──────────────────────────────────────────────────────────┤
│ ภาพรวม   │ breadcrumb                                               │
│ GROUP    │ Page title                              [primary action] │
│  item    │ description                                              │
│  item ●  │ tabs (status filters with counts)                        │
│ GROUP    │ ┌ panel ───────────────────────────────────────────────┐ │
│  item    │ │ toolbar: search · filters                            │ │
│          │ │ table                                                │ │
│ « ย่อเมนู │ │ pagination                                           │ │
│          │ └──────────────────────────────────────────────────────┘ │
│ 240px    │ footer: product name · version · environment             │
└──────────┴──────────────────────────────────────────────────────────┘
```

- **Menu:** `ink` background, grouped with small group labels, icon + label per item;
  active item = white text, 9% white fill, 3px `primary-bright` bar at the left edge.
  Collapsible to icons only. Items and groups:
  ภาพรวม · **ผู้ใช้และศูนย์:** ผู้ใช้งาน, ศูนย์และเครื่อง, คำขอข้อมูลส่วนบุคคล ·
  **การจอง:** ตารางเวลา, รายการจอง · **เนื้อหาและผล:** คอร์สและแบบฝึก, วิเคราะห์ผล.
  A lane adds or renames its items through a one-line PR to the nav definition.
- **Top bar:** menu toggle, center selector, help, user menu (name, role, sign out).
- **Content:** breadcrumb, then title + description on the left and the page's single
  primary action on the right; status filters as underlined tabs with counts.
- **Panels:** tables, charts and form groups sit in white panels with a 1px border and
  10px radius. A panel has an optional header row (title left, action right).
- **Tables:** header row on `surface-subtle`; numeric columns right-aligned with tabular
  figures; primary cell bold with an optional muted second line; row actions at the right
  (one text link + a "more" menu); selection checkboxes; sort indicators; pagination.
- **Status:** a coloured dot plus a word (`● เปิดใช้งาน`, `○ ฉบับร่าง`), not a filled
  pill. Small tags (6px radius) for attributes such as "สองนิ้วพร้อมกัน".
- **Stat tiles:** icon tile (44px, 10px radius, `primary-soft`) + label + number + delta.
- **Editors** (e.g. Pattern Editor): two columns of panels and a save bar pinned to the
  bottom that shows "มีการแก้ไขที่ยังไม่บันทึก" and the cancel / save buttons.
- **Forms:** label above the control, helper text below, units as a suffix inside the
  input; single column up to 560px unless paired fields belong together.

## 7. Components (`src/shared/ui`)

Every component: typed props, no data access, no module imports, keyboard and
screen-reader friendly. All exported from `@/shared/ui`.

**Used on both sides** (sizes and radii come from the scope variables):

| Component                              | Notes                                                                                                                                  |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                               | `variant`: primary · secondary (outline) · quiet (text) · danger; `size`: default · sm; `iconOnly`; `fullWidth`; `href` renders a link |
| `TextField`, `Textarea`, `NumberField` | Label above, helper, error with ✕ and message; `NumberField` takes a `unit` suffix                                                     |
| `Select`, `Checkbox`                   | Native controls, styled                                                                                                                |
| `ConfirmDialog`                        | Title, consequence text or list, cancel + confirm (primary or danger); focus trapped                                                   |
| `Toast`                                | Short confirmation after an action; never the only place an error is shown                                                             |
| `Notice`                               | Inline message with icon and tone: primary · success · danger · attention                                                              |
| `EmptyState`                           | Text + optional action, no illustration                                                                                                |
| `ComingSoon`                           | Placeholder for routes not built yet                                                                                                   |

**Elderly side:**

| Component         | Notes                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| `ElderHeader`     | Greeting or title, optional back button with the text "ย้อนกลับ", one ghost pill action                       |
| `Section`         | Optional eyebrow, heading, action; adds spacing and the top line                                            |
| `ListRow`         | Icon · title · subtitle · optional badge · chevron                                                          |
| `ChoiceList`      | Large single-select list (radio semantics); selected = `primary-soft` + ✓                                   |
| `Badge`           | Pill; `tone`: neutral · primary · success · danger · attention; success and danger always render their icon |
| `StepProgress`    | Segmented bar + "ขั้นที่ X จาก Y"                                                                               |
| `Meter`           | Segmented or continuous progress with a visible value                                                       |
| `PinPad`          | Large numeric keypad with delete, and the PIN dots                                                          |
| `ResultBanner`    | Round icon badge + heading + detail, tones success and danger                                               |
| `TabBar`          | Bottom navigation, 4 items                                                                                  |
| `DisplaySettings` | Text size (3 levels) and high-contrast toggle; persists in `localStorage`, applies the `<html>` attributes  |

**Admin side:**

| Component          | Notes                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| `AdminShell`       | Menu (groups, active state, collapse), top bar (toggle, center selector slot, help, user menu), footer |
| `PageHeader`       | Breadcrumb, title, description, action slot                                                            |
| `Tabs`             | Underlined tabs with optional counts                                                                   |
| `Panel`            | Bordered container with optional header (title, action)                                                |
| `DataTable`        | `Table`, `Th` (sortable state), `Td`, numeric alignment, row selection, row actions                    |
| `Pagination`       | Range text, rows-per-page, page buttons                                                                |
| `StatusDot`        | Dot + word; tones ok · draft · off · danger                                                            |
| `Tag`              | Small rectangular tag for attributes                                                                   |
| `StatTile`         | Icon tile, label, value with unit, delta                                                               |
| `SegmentedControl` | 2–3 exclusive options                                                                                  |
| `SaveBar`          | Pinned bar with dirty indicator and actions                                                            |

`Card` is **removed**. Existing uses (temporary home page, admin home, course list,
`ComingSoon`) are rewritten with the components above.

## 8. The 3x3 board

The engine lane owns `<PatternGrid />` (behaviour, timing, input). The design system owns
its look, as tokens and this spec:

- **Play board (elderly):** `primary-soft` background, 26px radius, 14px padding, 12px
  gap, square, as large as the screen allows (cell ≥ 20mm on phones, per the engine
  report). Cell: white, 20px radius, soft shadow. States: shown → `primary-tint`; lit →
  `primary` with glow; tapped in order → `primary` with the order number in white;
  correct → `success` with the order number or ✓; wrong → `danger` with ✕; two-finger
  cue → a notice above the board in `attention` tones. The board never moves or resizes
  while the user is tapping.
- **Editor grid (admin):** a tool, not a toy — 8px gap, cells with a 1px `line-strong`
  border, 10px radius and `surface-subtle` fill; a small cell number (1–9) in the
  top-left corner; chosen cell → `primary` with the order number; two-finger step →
  `attention-soft` fill with a 2px `attention` border, both cells sharing one number.

`/design` shows static pictures of both, labelled as the reference for the engine and
content lanes.

## 9. Voice and tone (UI text)

Thai, polite, short, encouraging, never blaming: "ไม่เป็นไรนะ ลองอีกครั้ง", not "ผิด".
Buttons are verbs ("เริ่มฝึก", "จองคิว", "ระงับบัญชี"). Numbers as digits. No English in
elderly UI except unavoidable proper nouns. Admin text is plain and factual; destructive
confirmations state what will happen as a short list.

## 10. The `/design` page

- Route `src/app/design/…`, infra-owned.
- Available when `APP_ENV` is `local` or `staging`; returns 404 in production.
- Two parts, each rendered inside its own scope: **elderly** and **admin**.
- Shows colour tokens with names and contrast, both type scales, every component in every
  variant and state, the high-contrast preview, both board references, a filled example
  screen per side, and a do/don't list with small examples.
- Each example shows the import line to copy.

## 11. Documentation and enforcement

- **`docs/design-system.md`** — the rules in short form (tokens, the two scopes, layout
  patterns, components, do/don't), linking to `/design` and the mockups. This is what
  humans and AIs read.
- **`AGENTS.md`** — the paragraph "UI for elderly users" is replaced by a short section
  pointing to `docs/design-system.md` with the hard rules: use `@/shared/ui`; no raw
  colours or arbitrary colour / font-size values; elderly side has no cards; admin side
  uses `AdminShell`, `Panel` and `DataTable`; ✓/✕ and words with every correct/wrong; one
  primary action per screen.
- **`docs/ai/CHAT-CONTEXT.md`** — updated token names and a compact component list.
- **ESLint** — a rule for `src/app/**` and `src/modules/**` rejecting string literals
  that contain a hex colour or an arbitrary Tailwind colour or font-size value
  (`bg-[#…]`, `text-[#…]`, `border-[#…]`, `text-[19px]` …). Other arbitrary values
  (widths, grid templates) stay allowed. `src/shared/ui`, `src/app/design` and
  `globals.css` are exempt.

## 12. Changes to existing code

- `globals.css`: replace the demov1 tokens with §5. Old utility names (`text-text-2`,
  `rounded-card`, `shadow-card`, `border-border`, …) are **removed, not aliased** — only
  infra code and the reference slice use them and no teammate has branched yet.
- `src/app/layout.tsx`: font weights 400/700 only.
- `src/app/(elder)/layout.tsx` and `src/app/(auth)/layout.tsx` (new): `data-ui="elder"`;
  the `(elder)` layout mounts `TabBar`; `(auth)` has no tab bar.
- `src/app/admin/layout.tsx`: `data-ui="admin"`, wrapped in `AdminShell` with the menu
  from §6.2; the admin gate stays.
- `src/app/(elder)/home/page.tsx` (new, infra-owned): the elderly home screen shell with
  placeholder content. Lanes later supply its sections (today's exercise from engine,
  weekly progress from analytics, next appointment from booking) through their `ui` entry
  points. The temporary `/` page redirects there.
- Restyle the reference slice (admin course list and create form) to the admin patterns —
  it is what every AI copies.
- `package.json`: add `lucide-react`.

## 13. Constraints and delivery

- Next.js 16, React 19, Tailwind CSS 4 (`@theme` in `globals.css`, no config file).
- Everything here is infra-owned hot files; the lead approves.
- No data or behaviour changes; visual and structural only. Build and CI stay green.
- Delivered as four pull requests into `staging`, each leaving the app working:
  (1) tokens, scopes and the shared components, with existing screens moved onto them;
  (2) the elderly kit, layouts and home screen; (3) the admin kit, shell and the restyled
  reference slice; (4) `/design`, the ESLint rule and the documentation.

## 14. Calls made by the designer (not decided by the lead)

- Admin body text 14.5px with a 12.5px minimum; elderly minimum 17.5px.
- The text-size control scales text only, and only on the elderly side.
- Search and notifications are reserved in the top bar but not rendered (§2).
- The elderly home page is infra-owned and composed from lane-supplied sections (§12).
- The profile page is reached from a list row on the home screen; `DisplaySettings` opens
  from the header button "ก ขนาดตัวอักษร".
- Chart palette (§5.1) and the scope of the ESLint rule (§11).
- Old token names are removed without aliases (§12).
- lucide-react for icons; no dark mode; ExtraBold font file dropped.

## 15. Left to the builder

- Exact Tailwind utility names for the tokens (short and obvious).
- Internal structure of each component file, and unit tests where a component has logic
  (`DisplaySettings` persistence, `StepProgress` text, `Pagination` ranges).
- How the admin menu collapses on narrow screens.
- Layout and ordering of the `/design` page.
- The exact ESLint selector, as long as the cases in §11 are rejected and the listed
  paths are exempt.
