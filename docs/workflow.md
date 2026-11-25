# Workflow

## Branches

```
feat/<lane>-<name> ─┐
fix/<lane>-<name>  ─┼─ PR ─►  staging  ── release PR (end of sprint) ─►  main
chore/<name>       ─┘        (staging env)                            (production)
```

| Branch                       | Deploys to | Who merges               | Rules                                          |
| ---------------------------- | ---------- | ------------------------ | ---------------------------------------------- |
| `main`                       | production | lead                     | Only from `staging` (or `hotfix/*`); protected |
| `staging`                    | staging    | PR author after approval | Protected; CI green + code-owner approval      |
| `feat/*`, `fix/*`, `chore/*` | nothing    | —                        | Branch from `staging`; delete after merge      |

## Day to day

```bash
git switch staging && git pull
git switch -c feat/engine-pattern-grid        # one issue = one branch

# … work inside your lane …

pnpm check && pnpm build                      # before every push
git push -u origin feat/engine-pattern-grid
gh pr create --base staging --fill            # then complete the template
```

Keep branches short-lived (a few days). Rebase on `staging` before asking for review:

```bash
git fetch origin && git rebase origin/staging
```

## Commits

Conventional Commits, lane as scope, imperative mood, English:

```
feat(booking): prevent double booking with a slot counter
fix(engine): ignore a third finger during a two-finger step
test(analytics): cover trend with fewer than three sessions
chore(infra): bump next to 16.4.7
docs(content): describe pattern timing overrides
```

## Pull requests

- Base branch: `staging`. Title in Conventional Commit style.
- Small: aim for under 400 changed lines; split bigger work.
- Link the issue: `Closes #123`.
- CI must pass: lint, format, typecheck, unit tests, build, migration check.
- Approval: one code owner of every lane the PR touches. A PR inside your own lane is
  approved by the lead or another teammate listed in CODEOWNERS for that path.
- Merge with **squash**; the PR title becomes the commit on `staging`.
- Touching another lane or a hot file? Say so at the top of the description and explain.

## Issues, labels, board

Work is tracked in GitHub Issues on a GitHub Projects board (columns: Backlog → Sprint
backlog → In progress → In review → Done).

| Label                                                                                      | Meaning                       |
| ------------------------------------------------------------------------------------------ | ----------------------------- |
| `module:identity`, `module:booking`, `module:content`, `module:engine`, `module:analytics` | Lane                          |
| `infra`                                                                                    | Hot files, CI/CD, tooling     |
| `cross-module`                                                                             | Needs agreement between lanes |
| `type:feature`, `type:bug`, `type:chore`, `type:docs`                                      | Kind of work                  |
| `sprint-1` … `sprint-6`                                                                    | Sprint                        |
| `blocked`                                                                                  | Waiting on someone else       |

Every issue has acceptance criteria. An AI assistant should be given the issue, not a
loose description.

## Sprints

Six two-week sprints, 23 Nov 2026 – 14 Feb 2027.

| When               | What                                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| First day          | Sprint planning: move issues to _Sprint backlog_, assign, label                                           |
| Daily              | Short sync; move cards; raise blockers early                                                              |
| Second-to-last day | Feature freeze on `staging`; test staging together                                                        |
| Last day           | Lead opens the release PR `staging` → `main`; after it merges, production deploys; review + retrospective |

## Releases

1. Lead opens `staging` → `main` with the list of merged PRs.
2. CI runs; the `production` environment asks for the lead's approval.
3. The workflow applies migrations to the production database, deploys, and calls
   `/api/health`.
4. Tag the release: `git tag sprint-<n> && git push origin sprint-<n>`.

## Hotfixes

For a production bug that cannot wait for the sprint end:

1. `git switch main && git pull && git switch -c hotfix/<name>`
2. Fix, PR into `main` (allowed for `hotfix/*`), lead approves.
3. Immediately PR `main` → `staging` so the fix is not lost.

## When CI fails

| Job        | Usual cause                                                         | Fix                                          |
| ---------- | ------------------------------------------------------------------- | -------------------------------------------- |
| Lint       | Import across module boundaries, unused code                        | Use the module entry point; remove dead code |
| Format     | Not formatted                                                       | `pnpm format`                                |
| Typecheck  | Type error, or a stale generated client                             | `pnpm install` then `pnpm typecheck`         |
| Test       | A real regression                                                   | Fix the code, not the test                   |
| Build      | Data access outside `<Suspense>`, server code in a client component | See `docs/architecture.md` → Rendering model |
| Migrations | Schema changed without a migration, or migration conflict           | `pnpm db:migrate`, rebase on `staging`       |
| PR target  | PR into `main` from a branch other than `staging` / `hotfix/*`      | Retarget to `staging`                        |
