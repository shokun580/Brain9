# Architecture

## Shape

A single Next.js 16 application ("modular monolith") deployed to Vercel, talking to one
PostgreSQL database on Neon through Prisma. There is no separate backend service: server
code runs in Server Components, Server Actions and Route Handlers.

Why one app: four developers, one deploy pipeline, shared types end to end, and it matches
what the project report describes.

## Layers

```
┌────────────────────────────────────────────────────────────────────┐
│ src/app            routes: thin pages, layouts, route handlers      │
├────────────────────────────────────────────────────────────────────┤
│ src/modules/*      identity · booking · content · engine · analytics│
│                    each: public entry points + private internals    │
├────────────────────────────────────────────────────────────────────┤
│ src/shared         db, env, ActionResult, UI kit                    │
├────────────────────────────────────────────────────────────────────┤
│ PostgreSQL (Neon)  one schema; each module owns its own tables      │
└────────────────────────────────────────────────────────────────────┘
```

Dependencies point downwards only. ESLint (`no-restricted-imports` in
`eslint.config.mjs`) fails the build when a file breaks these rules.

## Data flow between modules

```
identity ──► who is the user, which role, home or center device
   │
content ──► courses / exercises / patterns (PatternSteps JSON)
   │
engine ──► plays patterns, records training_sessions / item_results / item_attempts
   │
analytics ──► session_summaries, performance levels, trends, recommendations

booking ──► seats at community centers; identity asks it during center-device login
```

## Inside a module

```
src/modules/content/
  index.ts          public server API   →  import … from "@/modules/content"
  contracts.ts      public pure types   →  import … from "@/modules/content/contracts"
  ui/index.ts       public components   →  import … from "@/modules/content/ui"
  server/           private: queries (`*-queries.ts`), actions (`*-actions.ts`), services
  ui/               private: components
  *.test.ts         unit tests
  AGENTS.md         the lane's rules, decided domain rules, and backlog
```

Three entry points exist because server code, browser code and pure types have different
constraints: a browser component must never pull in `server-only` code through a barrel.

## Routes and who owns them

| Route                                                                | Purpose                                          | Owner       |
| -------------------------------------------------------------------- | ------------------------------------------------ | ----------- |
| `/`                                                                  | Temporary landing page                           | infra       |
| `/login`, `/register` — `(auth)`                                     | Login, sign-up with consent, center-device setup | identity    |
| `/courses`, `/play/…` — `(elder)`                                    | Choose and play exercises                        | engine      |
| `/results` — `(elder)`                                               | Own results and recommendation                   | analytics   |
| `/booking` — `(elder)`                                               | Book / cancel a seat                             | booking     |
| `/profile` — `(elder)`                                               | Own data, consent, privacy requests              | identity    |
| `/admin`                                                             | Admin shell and home                             | infra       |
| `/admin/users`, `/admin/centers`, `/admin/devices`, `/admin/privacy` | People, centers, devices, PDPA requests          | identity    |
| `/admin/schedule`, `/admin/bookings`                                 | Opening hours, day lists                         | booking     |
| `/admin/content/…`                                                   | Courses, exercises, Pattern Editor               | content     |
| `/admin/analytics`                                                   | Dashboard for all users                          | analytics   |
| `/api/health`                                                        | Deploy health check                              | infra       |
| `/api/<module>/…`                                                    | Route handlers of that module                    | that module |

Route groups `(auth)` and `(elder)` do not appear in the URL; they only share a layout.

## Rendering model (Next.js 16, Cache Components on)

- A page function does no data access. It returns static markup plus `<Suspense>`
  boundaries.
- A component that reads the session or the database is an `async` Server Component
  rendered **inside** `<Suspense>`. Reading cookies or the database outside a boundary is
  a build error.
- Mutations are Server Actions that end with `refresh()` (or `updateTag()` for cached
  data) and return an `ActionResult`.
- Add `"use cache"` only to data that is the same for everyone (for example published
  courses), with `cacheLife` and `cacheTag`. Never cache per-user data on the server
  without thinking about PDPA; when in doubt, do not cache.

Reference implementation: `src/app/admin/content/courses/page.tsx` and
`src/modules/content/`.

## Authentication model

- `getCurrentUser()` from `@/modules/identity` is the only source of the current user.
- Sessions are server-side rows (`auth_sessions`) referenced by a random token in an
  HttpOnly cookie. Community-center devices carry a second cookie, the device token.
- Until the identity lane ships login, `getCurrentUser()` has a **local-only** bypass:
  with `APP_ENV=local`, `NODE_ENV≠production` and `DEV_AUTH_ROLE` set, requests are
  treated as the seeded demo ADMIN or USER. It cannot activate on Vercel.

## Environments

|           | Local                            | Staging                                  | Production               |
| --------- | -------------------------------- | ---------------------------------------- | ------------------------ |
| Branch    | any                              | `staging`                                | `main`                   |
| App       | `localhost:3000`                 | Vercel preview deployment + stable alias | Vercel production        |
| Database  | own Neon branch / local Postgres | Neon branch `staging`                    | Neon branch `production` |
| `APP_ENV` | `local`                          | `staging`                                | `production`             |
| Demo seed | yes                              | yes                                      | never                    |
