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

<!-- Commands run, screens checked (phone + tablet width), cases tried. -->

- [ ] `pnpm check` passes
- [ ] `pnpm build` passes

## Database

- [ ] No schema change
- [ ] Schema change with **one** migration, rebased on `staging`; `docs/database.md` updated if tables changed

## Checklist

- [ ] Every new query / action / route handler authorizes on the server
- [ ] All input validated with Zod on the server
- [ ] New logic has unit tests
- [ ] User-facing text is Thai; UI follows the elderly-friendly rules
- [ ] No secrets, no real personal data, nothing sensitive in logs

## AI assistance

<!-- Which tool helped, and for what. You reviewed every line. -->

## Not done / follow-ups

<!-- Anything deliberately left out. -->
