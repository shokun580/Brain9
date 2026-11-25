# Brain9

Brain-training web app for elderly people: memorise and tap sequences on a 3x3 grid, at
home or at a community center. Senior project, Software Engineering, Faculty of
Informatics, Burapha University.

|                                        |                                                                                                         |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Stack                                  | Next.js 16 (App Router, TypeScript) · React 19 · Tailwind CSS 4 · Prisma 7 · PostgreSQL (Neon) · Vercel |
| Environments                           | `staging` branch → staging · `main` branch → production                                                 |
| Rules for humans **and AI assistants** | [`AGENTS.md`](AGENTS.md) — read it before contributing                                                  |

## Team and lanes

| Lane                        | Owner              | GitHub                                       |
| --------------------------- | ------------------ | -------------------------------------------- |
| identity + booking          | Chanon (66160347)  | [@chanon-max](https://github.com/chanon-max) |
| content · infra (team lead) | Apinan (66160107)  | [@shokun580](https://github.com/shokun580)   |
| engine                      | Supanat (66160239) | [@Pxrch](https://github.com/Pxrch)           |
| analytics                   | Saruta (66160375)  | [@ptxsm](https://github.com/ptxsm)           |

## Getting started

Requirements: Node.js 24 (`nvm use`), pnpm 10, and a PostgreSQL database.

```bash
git clone https://github.com/shokun580/Brain9.git
cd Brain9
nvm use                 # Node 24, from .nvmrc
pnpm install            # installs dependencies and generates the Prisma client
cp .env.example .env.local
```

Set `DATABASE_URL` in `.env.local` to one of:

- **your own Neon branch** `dev/<your-name>` (ask the lead for the connection string), or
- **a local Postgres**: `createdb brain9_dev`, or
- **Docker**: `pnpm db:up` (Postgres on port 5433, see `.env.example`).

Then:

```bash
pnpm db:deploy          # apply all migrations
pnpm db:seed            # demo admin, demo user, one center, one sample course
pnpm dev                # http://localhost:3000
```

With `DEV_AUTH_ROLE="ADMIN"` in `.env.local` you are signed in as the demo admin (local
only), so <http://localhost:3000/admin/content/courses> works straight away.

## Everyday commands

| Command                                | What it does                                          |
| -------------------------------------- | ----------------------------------------------------- |
| `pnpm dev`                             | Start the dev server                                  |
| `pnpm check`                           | Lint + typecheck + unit tests — run before every push |
| `pnpm build`                           | Production build                                      |
| `pnpm format`                          | Format with Prettier                                  |
| `pnpm db:migrate --name <lane>_<what>` | Create and apply a migration from your schema change  |
| `pnpm db:seed`                         | Load demo data (local / staging only)                 |
| `pnpm db:studio`                       | Browse the database                                   |

## Documentation

| Document                                             | Read it when                                |
| ---------------------------------------------------- | ------------------------------------------- |
| [`AGENTS.md`](AGENTS.md)                             | Always — rules, lanes, conventions          |
| [`docs/architecture.md`](docs/architecture.md)       | You want to know where code goes            |
| [`docs/ownership.md`](docs/ownership.md)             | You are unsure whether a file is yours      |
| [`docs/database.md`](docs/database.md)               | You touch tables or migrations              |
| [`docs/workflow.md`](docs/workflow.md)               | You open a branch, PR or release            |
| [`docs/deployment.md`](docs/deployment.md)           | You set up or debug staging / production    |
| [`docs/contracts/`](docs/contracts/)                 | You call another module                     |
| [`docs/decisions.md`](docs/decisions.md)             | You wonder why something is the way it is   |
| [`docs/ai/CHAT-CONTEXT.md`](docs/ai/CHAT-CONTEXT.md) | You use a chat AI that cannot read the repo |

## Licences

Code: project coursework, all rights reserved by the team unless stated otherwise.
Font: LINE Seed Sans TH © LINE Corporation, SIL Open Font License 1.1.
