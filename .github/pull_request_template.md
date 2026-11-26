<!-- Title: Conventional Commit style, e.g. "feat(engine): detect two-finger taps" -->

## What and why

<!-- One or two sentences. Link the issue. -->

Closes #

## Lane

- [ ] identity
- [ ] booking
- [ ] content
- [ ] engine
- [ ] analytics
- [ ] infra

**Touches files outside my lane or a hot file:** no / yes — <!-- which, and who agreed (link the issue) -->

## How I tested it

<!-- Commands run, screens checked (elderly: 360px, 768px, 1280px and the largest text size;
     admin: 768px, 1024px, 1440px), cases tried. -->

- [ ] `pnpm check` passes
- [ ] `pnpm build` passes

## Database

- [ ] No schema change
- [ ] Schema change with **one** migration, rebased on `staging`; `docs/database.md` updated if tables changed

## Checklist

- [ ] Every new query / action / route handler authorizes on the server
- [ ] All input validated with Zod on the server
- [ ] New logic has unit tests
- [ ] User-facing text is Thai; UI is built only from @/shared/ui and tokens, following docs/design-system.md
- [ ] No secrets, no real personal data, nothing sensitive in logs
- [ ] The security checklist in docs/security.md §8 holds

## AI assistance

<!-- Which tool helped, and for what. You reviewed every line. -->

## Not done / follow-ups

<!-- Anything deliberately left out. -->
