# Ownership

Who may change what. GitHub enforces this with [`.github/CODEOWNERS`](../.github/CODEOWNERS):
a pull request needs approval from an owner of every path it touches.

## Lanes

| Lane      | Owner                      | Paths                                                                                                                                                                                                                                                                 |
| --------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| identity  | Chanon `@chanon-max`       | `src/modules/identity/**` · `prisma/schema/identity.prisma` · `prisma/schema/centers.prisma` · `src/app/(auth)/**` · `src/app/(staff)/admin/login/**` · `src/app/(elder)/profile/**` · `src/app/admin/{users,centers,devices,privacy}/**` · `src/app/api/identity/**` |
| booking   | Chanon `@chanon-max`       | `src/modules/booking/**` · `prisma/schema/booking.prisma` · `src/app/(elder)/booking/**` · `src/app/admin/{schedule,bookings}/**` · `src/app/api/booking/**`                                                                                                          |
| content   | Apinan `@shokun580`        | `src/modules/content/**` · `prisma/schema/content.prisma` · `src/app/admin/content/**` · `src/app/api/content/**` · `docs/contracts/pattern-format.md`                                                                                                                |
| engine    | Supanat `@Pxrch`           | `src/modules/engine/**` · `prisma/schema/engine.prisma` · `src/app/(elder)/courses/**` · `src/app/(elder)/play/**` · `src/app/api/engine/**`                                                                                                                          |
| analytics | Saruta `@ptxsm`            | `src/modules/analytics/**` · `prisma/schema/analytics.prisma` · `src/app/(elder)/results/**` · `src/app/admin/analytics/**` · `src/app/api/analytics/**`                                                                                                              |
| infra     | Apinan `@shokun580` (lead) | everything else — see hot files below                                                                                                                                                                                                                                 |

The team lead is a co-owner of every lane so that a pull request always has someone who
can approve it.

## Hot files (infra)

Changing these affects everyone, so only the lead changes them, on request:

- Dependencies and tooling: `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`,
  `tsconfig.json`, `eslint.config.mjs`, `vitest.config.mts`, `next.config.ts`,
  `prisma.config.ts`, `vercel.json`, `.env.example`
- Shared code: `src/shared/**`, `src/proxy.ts`
- App shell: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`,
  `src/app/(elder)/layout.tsx`, `src/app/(staff)/layout.tsx`, `src/app/admin/layout.tsx`,
  `src/app/admin/page.tsx`,
  `src/app/admin/template.tsx`, `src/app/(elder)/template.tsx`, `src/app/design/**`,
  `src/app/icon.svg`, `src/app/not-found.tsx`, `src/app/error.tsx`,
  `src/app/global-error.tsx`, `src/app/_system/**`
- Database base: `prisma/schema/_base.prisma`, `prisma/seed.ts`
- Automation and rules: `.github/**`, `scripts/**`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`,
  `docs/**`

Two deliberate exceptions, so nobody is blocked on the lead:

- **`prisma/migrations/**`** — anyone adds a migration for their own schema file; the
  lead reviews every migration.
- **`prisma/seed.ts`** — each lane may add demo rows inside its own marked section.

## Shared screens

A screen that is not under one lane's routes belongs to infra, which designs and builds it.
The other lanes work on the screens under their own routes and do not edit these.

| Screen                               | File                                                                   | What a lane provides                                                                                                           |
| ------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Entry page `/`                       | `src/app/page.tsx`                                                     | identity: where a signed-out visitor and a center device go                                                                    |
| Elderly home `/home`                 | `src/app/(elder)/home/**`                                              | identity: the person's name · engine: today's exercise · analytics: the week and the latest result · booking: the next booking |
| Admin overview `/admin`              | `src/app/admin/page.tsx`                                               | analytics: the figures of the day                                                                                              |
| 404 and error screens                | `src/app/not-found.tsx`, `error.tsx`, `global-error.tsx`, `_system/**` | nothing                                                                                                                        |
| Layouts, the admin menu, the tab bar | `src/app/**/layout.tsx`, `src/app/admin/nav.tsx`, `src/shared/ui/**`   | a one-line menu entry for its own pages                                                                                        |

How a lane's data reaches a shared screen: infra opens a cross-module request, the lane
exports a function or a component from its entry point (`@/modules/<lane>` or
`@/modules/<lane>/ui`), and infra places it. Each `TODO(<lane>)` in those files marks one
such piece that is still a placeholder.

## Shared edges

| Thing                                              | Lives in | Used by                  | Rule                                                         |
| -------------------------------------------------- | -------- | ------------------------ | ------------------------------------------------------------ |
| `getCurrentUser()` / `CurrentUser`                 | identity | everyone                 | Signature is frozen; changes need all lanes' approval        |
| `PatternSteps` JSON                                | content  | engine, analytics        | Versioned (`v`); see `docs/contracts/pattern-format.md`      |
| `<PatternGrid />`                                  | engine   | content (Pattern Editor) | Props agreed in a cross-module issue                         |
| `item_results` table                               | engine   | analytics                | Column changes need analytics' approval                      |
| `User` model back-relations                        | identity | everyone                 | Adding a relation field is fine; the identity owner approves |
| Design tokens / UI kit                             | infra    | everyone                 | Request additions with an `infra` issue                      |
| Admin menu (`adminNav` in `src/app/admin/nav.tsx`) | infra    | everyone                 | One-line PRs welcome, lead approves                          |

## Requesting a change outside your lane

Use the **Cross-module request** issue template. Say exactly what you need (function
signature, component props, column), why, and by when. The owner replies with the agreed
contract; it is then recorded in `docs/contracts/`.
