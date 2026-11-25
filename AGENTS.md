# Brain9 — rules for AI agents and contributors

Brain9 is a brain-training web app for elderly people (a 3x3 pattern grid), built by a
four-person team. **Each person owns one lane and works with their own AI assistant.**
This file is the single source of truth for how every human and every AI works in this
repository. `CLAUDE.md` and `GEMINI.md` only point here.

If anything here conflicts with a request, stop and ask your human before continuing.

---

## 0. Before you write anything

1. **Know your lane.** Ask your human which lane you are working in if they have not said
   (see the table in §1). You work in exactly one lane per task.
2. **Read your lane's rules:** `src/modules/<lane>/AGENTS.md`.
3. **Read the task:** the GitHub issue you were given. No issue → ask for one or create one.
4. **Check the framework docs** — this project uses Next.js 16 and Prisma 7, which differ
   from older versions you may know (see the block at the bottom of this file).

## 1. Lanes

| Lane        | Owner              | GitHub        | Owns                                                                                                                 |
| ----------- | ------------------ | ------------- | -------------------------------------------------------------------------------------------------------------------- |
| `identity`  | Chanon (66160347)  | `@chanon-max` | users, login (phone + PIN), sessions, roles, PDPA consent, data-subject requests, audit log, centers, center devices |
| `booking`   | Chanon (66160347)  | `@chanon-max` | weekly schedule, time slots, seat bookings, check-in                                                                 |
| `content`   | Apinan (66160107)  | `@shokun580`  | courses, exercises, patterns, Pattern Editor, training settings                                                      |
| `engine`    | Supanat (66160239) | `@Pxrch`      | 3x3 grid component, playing patterns, two-finger input, timing, training/test modes, saving results                  |
| `analytics` | Saruta (66160375)  | `@ptxsm`      | metrics, progress trend, performance level, charts, recommendations, admin dashboard                                 |
| `infra`     | Apinan (team lead) | `@shokun580`  | CI/CD, config, dependencies, `src/shared`, root layouts, design tokens, this file                                    |

Exact paths per lane: [`docs/ownership.md`](docs/ownership.md). GitHub enforces it through
[`.github/CODEOWNERS`](.github/CODEOWNERS).

## 2. Hard rules

1. **Stay in your lane.** Create and edit files only in the paths your lane owns.
2. **Never edit another lane's files to make your code work.** Open a
   _cross-module request_ issue instead (§7) and code against the agreed contract.
3. **Never edit hot files** (§6) unless your human is the team lead or the lead approved
   the change in the issue.
4. **Never push to `main` or `staging`**, never force-push a shared branch, never merge
   your own pull request without the required approval.
5. **Never commit secrets** (`.env*` other than `.env.example`, tokens, connection
   strings) and never print them in logs, comments, or chat.
6. **Never put real personal data** (names, phone numbers, results of real people) in
   code, seeds, tests, issues, or prompts. Use obviously fake data.
7. **Never edit a migration that is already on `staging`.** Add a new migration.
8. **Never weaken a check to get green CI** (deleting tests, `eslint-disable`,
   `@ts-ignore`, `any`). Fix the cause, or explain in the PR why it cannot be fixed.
9. **Never add a dependency** without the lead's approval in the issue.
10. **Do not invent requirements.** If the issue does not say, ask.

## 3. Architecture in one page

One Next.js app (App Router, TypeScript, Server Components) + PostgreSQL through Prisma.

```
src/
  app/                 routes only — thin files that compose module UI
    (auth)/            login, sign-up                          → identity
    (elder)/           elderly-facing screens                  → engine, analytics, booking, identity
    admin/             admin screens                           → each module's own subfolder
    api/               route handlers                          → /api/<module>/…
  modules/
    <lane>/
      index.ts         PUBLIC server API of the module (queries, types)
      contracts.ts     PUBLIC pure types + Zod schemas (safe in the browser)
      ui/index.ts      PUBLIC React components
      server/          private: queries, Server Actions, business logic
      ui/              private: components
      *.test.ts        unit tests next to the code
      AGENTS.md        the lane's own rules and backlog
  shared/
    lib/               db, env, ActionResult, small helpers        (infra)
    ui/                design-system components                     (infra)
  generated/prisma/    generated client — never edit, never commit
prisma/
  schema/<lane>.prisma one schema file per lane
  migrations/          SQL migrations, applied in order
```

More detail: [`docs/architecture.md`](docs/architecture.md).

### Module boundaries (enforced by ESLint)

- Import another module **only** through `@/modules/<name>`, `@/modules/<name>/ui`, or
  `@/modules/<name>/contracts`. Anything deeper is an error.
- Inside your own module use **relative** imports.
- `src/shared` never imports from `src/modules` or `src/app`.
- `src/modules` never imports from `src/app`.
- Database access goes through `db` from `@/shared/lib/db`. A module reads and writes
  **only its own tables**; to get another lane's data, call that module's public API.

## 4. How to write code here

The reference implementation is the course feature — copy its shape:
`src/modules/content/` and `src/app/admin/content/courses/page.tsx`.

**Pages (`src/app/**/page.tsx`)** stay thin: no database or session access in the page
function. Compose components from a module's `ui` entry point and wrap every component
that reads data in `<Suspense>` with a fallback. (Cache Components is on: reading cookies
or the database outside `<Suspense>` is a build error.)

**Server Actions** follow six steps in this order — see `course-actions.ts`:

1. authorize — call `getCurrentUser()` inside the action; never trust the page or layout
2. validate — parse input with a Zod schema from `contracts.ts`
3. write — one `db` call or one transaction
4. audit — `recordAudit()` for admin changes and anything touching personal data
5. refresh — `refresh()` / `updateTag()` so the UI shows fresh data
6. return an `ActionResult` (`ok(...)` / `fail(...)`) — do not throw for expected failures

**Authorization** — every query, action and route handler authorizes itself with
`getCurrentUser()`, `requireUser()` or `requireAdmin()` from `@/modules/identity`.
Layouts are not a security boundary. An elderly user may only ever read their own data.

**Validation** — all external input (forms, JSON bodies, URL params) is parsed with Zod on
the server. Client-side checks are for convenience only.

**TypeScript** — `strict` is on. No `any`, no non-null `!` on values you have not checked.

**Naming** — code, identifiers, comments, commit messages, docs: **English**.
User-facing text: **Thai**, polite and encouraging ("ไม่เป็นไรนะ ลองอีกครั้ง"), never blaming.

**UI for elderly users** — use `@/shared/ui` and the tokens in `globals.css`:
touch targets ≥ 64px, body text ≥ 20px (rem-based), every icon has a text label, never
convey meaning by colour alone (pair with ✓ / ✕ / words), one step at a time with
"ขั้นที่ X จาก Y", confirm before anything irreversible, respect `data-size` and
`data-contrast` on `<html>`.

**Tests** — pure logic (scoring, validation, metrics, slot rules) must have Vitest unit
tests next to the code (`*.test.ts`). Keep logic in pure functions so it is testable
without a database.

**Comments** — explain _why_, not _what_. Mark unfinished work as `TODO(<lane>): …`.

## 5. Database rules

- Your models live in **your** `prisma/schema/<lane>.prisma`. Table and column names are
  `snake_case` via `@@map` / `@map`; ids are `uuid(7)`; timestamps are `timestamptz`.
- Changing your schema: edit your `.prisma` file → `pnpm db:migrate --name <lane>_<what>`
  → review the generated SQL → commit schema and migration together.
- **One migration per PR.** Before opening the PR, rebase on `staging`; if someone merged
  a migration first, delete yours, re-run `pnpm db:migrate`, and commit the new one.
- A relation to another lane's table needs a back-relation field in that lane's model.
  That one-line edit is allowed, but the other owner must approve the PR.
- CHECK constraints and partial unique indexes are hand-written SQL appended to the
  migration (Prisma cannot express them). Keep them when you touch those columns.
- **Soft delete only.** No row is ever physically deleted. Every table has `deleted_at`;
  removing something sets it (`data: softDelete()` from `@/shared/lib/soft-delete`).
  `db.<model>.delete()` / `.deleteMany()` are an ESLint error, raw SQL `DELETE` / `TRUNCATE`
  is forbidden the same way, and no relation uses `onDelete: Cascade`.
- **Read live rows by default.** Every query filters `deleted_at IS NULL`
  (`where: notDeleted`), including nested relations and counts. Include deleted rows only
  for a stated reason, and say why in a comment.
- **Ledgers are the exception.** `user_consents`, `audit_logs`, `item_results` and
  `item_attempts` are append-only: no `deleted_at`, never deleted, and never updated once
  written (results: once the item is completed).
- A value that must be reusable after a soft delete (a phone number, a center code) is
  unique through a hand-written partial index `WHERE "deleted_at" IS NULL`, so there is no
  `@unique` in the schema: look it up with `findFirst` + `notDeleted`, not `findUnique` /
  `upsert`. A new model needs `deletedAt` and this decision for each of its unique rules.
- **PDPA erasure overwrites, it does not delete.** The personal fields of the person's
  rows are overwritten (anonymised) and every row is kept — see
  [`src/modules/identity/AGENTS.md`](src/modules/identity/AGENTS.md) for the columns.
- Table catalogue and ERD: [`docs/database.md`](docs/database.md).

## 6. Hot files — lead approval required

`package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `next.config.ts`, `tsconfig.json`,
`eslint.config.mjs`, `vitest.config.mts`, `prisma.config.ts`, `prisma/schema/_base.prisma`,
`prisma/seed.ts` (outside your marked section), `src/app/layout.tsx`, `src/app/globals.css`,
`src/app/page.tsx`, `src/app/(elder)/layout.tsx`, `src/app/admin/layout.tsx`, `src/shared/**`,
`.github/**`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `docs/**` (except your module's docs),
`.env.example`, `vercel.json`.

Need a change there? Open an issue labelled `infra` describing what and why.

## 7. Working across lanes

When you need something from another lane (a function, a component, a column):

1. Open an issue with the **Cross-module request** template, labelled `cross-module` and
   the target lane's label. State the exact signature / shape you need and why.
2. The owner agrees the contract in the issue and exports it from their entry point.
3. Until it lands, code against the agreed type with a clearly marked stub in **your**
   lane (`TODO(<your-lane>): replace when <issue link> lands`).

Agreed contracts are recorded in [`docs/contracts/`](docs/contracts/). Changing a contract
that others already use requires approval from every lane that consumes it.

## 8. Git workflow

- Branch from `staging`: `feat/<lane>-<short-name>`, `fix/<lane>-<short-name>`,
  `chore/<short-name>`. One issue per branch; keep PRs small (aim for < 400 changed lines).
- Commits: Conventional Commits with the lane as scope —
  `feat(engine): detect simultaneous two-finger taps`.
- Before pushing: `pnpm check` (lint + typecheck + tests) and `pnpm build`.
- Open the PR **into `staging`**, fill in the template, link the issue (`Closes #123`).
  CI must be green and a code owner must approve.
- `staging` → `main` is one release PR at the end of each sprint, opened by the lead.

Full process: [`docs/workflow.md`](docs/workflow.md).

## 9. Commands

```bash
pnpm install          # also generates the Prisma client
pnpm dev              # http://localhost:3000
pnpm check            # lint + typecheck + unit tests  (run before every push)
pnpm build            # production build
pnpm format           # Prettier
pnpm db:migrate       # create + apply a migration on your dev database
pnpm db:seed          # demo data (local/staging only)
pnpm db:studio        # browse the database
pnpm db:drift         # verify the database matches the schema
```

Setup from zero: [`README.md`](README.md).

## 10. Privacy and security (PDPA)

Training results linked to a person may count as health-related sensitive data.

- Collect only the fields the schema already defines. A new personal field needs the lead's
  approval and an update to the privacy notice.
- Never log, return to the browser, or expose in an error message: PINs, passwords,
  credential hashes, session or device tokens, full phone numbers.
- Only ADMIN may read another person's data, and every such read or change calls
  `recordAudit()`.
- Consent is a ledger: granting and withdrawing each insert a row in `user_consents`.
- Credentials are bcrypt hashes; session and device tokens are stored only as SHA-256.

## 11. Definition of done

- [ ] Meets the issue's acceptance criteria, and nothing beyond its scope
- [ ] Only files in your lane changed (or the other owner approved)
- [ ] `pnpm check` and `pnpm build` pass locally
- [ ] New logic has unit tests
- [ ] Server-side authorization and Zod validation on every new entry point
- [ ] Thai UI text, elderly-friendly sizing, works at phone and tablet widths
- [ ] Schema change → migration committed, `docs/database.md` updated if tables changed
- [ ] PR description says what changed, how it was tested, and what is not done

## 12. When you are unsure

Stop and ask your human. A wrong guess in a shared codebase costs four people time.
Good questions to raise: "this needs a file outside my lane", "the issue does not define
X", "this contract seems to need a change", "CI fails for a reason outside my change".

---

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

### Version notes specific to this repo

- **Next.js 16.4** — Cache Components and Partial Prefetching are enabled; middleware is
  now `src/proxy.ts`; use `refresh()` from `next/cache` after a mutation; route `params`
  are async. Start with `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`
  and `02-guides/authentication-with-cache-components.md`.
- **Prisma 7.10** — generator is `prisma-client` with output in `src/generated/prisma`;
  the connection URL lives in `prisma.config.ts`, not in the schema; the client is created
  with a driver adapter (`@prisma/adapter-pg`); the CLI does not auto-load `.env`. Do not
  upgrade to Prisma 8 without the lead.
- **Zod 4**, **Tailwind CSS 4** (tokens in `globals.css` via `@theme`, no
  `tailwind.config`), **React 19** (`useActionState`, `use`).
