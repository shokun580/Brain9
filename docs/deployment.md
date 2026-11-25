# Deployment

How staging and production are wired, and the one-time setup the team lead performs.

## How it works

```
PR ──► ci.yml ............ lint · format · typecheck · test · build · migration check
merge to staging ──► deploy-staging.yml
        1. vercel pull   (preview environment, branch "staging")  → env vars incl. database URL
        2. prisma migrate deploy  → Neon branch "staging"
        3. vercel build + vercel deploy --prebuilt
        4. vercel alias  → stable staging URL
        5. GET /api/health
merge to main ──► deploy-production.yml   (waits for the lead's approval)
        same steps against the production environment and Neon branch "production"
```

Deploys are done by GitHub Actions with the Vercel CLI and the lead's token, not by
Vercel's Git integration. That is what lets every team member's commits deploy on the
free Hobby plan. `vercel.json` turns Vercel's own Git deployments off so nothing deploys
twice.

Database credentials live in **one place — Vercel environment variables**. The workflows
read them with `vercel pull`; they are not duplicated in GitHub.

## One-time setup (team lead)

Run these on your own machine. Never paste tokens or connection strings into chat, issues
or commits.

### 1. Neon

1. Create a Neon project `brain9` (region: Singapore, PostgreSQL 17).
2. Rename the default branch to `production`.
3. Create branch `staging` from `production`.
4. Create one branch per developer from `staging`: `dev/apinan`, `dev/chanon`,
   `dev/supanat`, `dev/saruta` (the free plan allows 10 branches).
5. For `production` and `staging`, copy both connection strings: **pooled** (host contains
   `-pooler`) and **direct**.
6. Send each developer the pooled string of their own `dev/*` branch privately.

### 2. Vercel

```bash
vercel login
cd Brain9
vercel link            # create a new project named "brain9"; do NOT connect a Git repository
```

In the Vercel dashboard → project → **Settings → Environment Variables**:

| Variable       | Production                | Preview                |
| -------------- | ------------------------- | ---------------------- |
| `DATABASE_URL` | Neon `production`, pooled | Neon `staging`, pooled |
| `DIRECT_URL`   | Neon `production`, direct | Neon `staging`, direct |
| `APP_ENV`      | `production`              | `staging`              |

Also in the dashboard:

- **Settings → Deployment Protection → Vercel Authentication: off** (otherwise the staging
  URL asks teammates to log in to Vercel and the health check fails).
- **Settings → Domains**: note the production domain (`brain9.vercel.app` or similar) and
  choose a staging alias, for example `brain9-staging.vercel.app`.

### 3. GitHub secrets and variables

`vercel link` wrote `.vercel/project.json` (git-ignored) containing `orgId` and
`projectId`. Create a Vercel token at <https://vercel.com/account/tokens>.

```bash
gh secret set VERCEL_TOKEN          # paste the token when prompted
gh secret set VERCEL_ORG_ID         # orgId from .vercel/project.json
gh secret set VERCEL_PROJECT_ID     # projectId from .vercel/project.json
gh variable set STAGING_DOMAIN --body "brain9-staging.vercel.app"
gh variable set DEPLOY_ENABLED --body true      # do this last: it switches the deploy workflows on
```

Until `DEPLOY_ENABLED` is `true` the deploy jobs are skipped, so merging before the setup
is finished does not produce failed runs.

### 4. Branch ruleset

`main` and `staging` are protected by one repository ruleset, created by hand at
**Settings → Rules → Rulesets → New branch ruleset**:

| Field              | Value                                                         |
| ------------------ | ------------------------------------------------------------- |
| Ruleset name       | `protect-main-and-staging`                                    |
| Enforcement status | **Active**                                                    |
| Bypass list        | **Repository admin**, allowed for pull requests only          |
| Target branches    | _Include default branch_, plus _Include by pattern_ `staging` |

Rules to enable:

- **Restrict deletions**
- **Block force pushes**
- **Require a pull request before merging** — required approvals `1`, dismiss stale
  approvals, require review from Code Owners, require conversation resolution; allowed
  merge methods: merge and squash
- **Require status checks to pass** — require branches to be up to date; checks
  `target-guard`, `check`, `migrations`

Leave everything else off. In particular **Restrict updates** would block every merge,
**Restrict creations** would stop the `staging` branch from being created, and **Require
linear history** would reject the release pull request, which uses a merge commit.

The admin bypass exists because the lead cannot approve their own pull requests; use it
only for that.

### 5. Staging branch, labels, environments

Merge the infrastructure pull request into `main` **first** — the `target-guard` check
starts rejecting pull requests into `main` from other branches as soon as `staging`
exists. Then:

```bash
./scripts/setup-github.sh
```

The script (read it first) sets the merge options, creates the `staging` branch from
`main`, the labels, and the `staging` and `production` environments (production requires
your approval). It does not touch branch rules; it only reports whether an active ruleset
exists.

### 6. Project board

Create a GitHub Project (board layout) named "Brain9", add the columns from
`docs/workflow.md`, and link the repository.

### 7. First deploy

1. Finish steps 1–5 above.
2. Push any commit to `staging` (or re-run the _Deploy staging_ workflow).
3. Open `https://<staging domain>/api/health` → `{"status":"ok","env":"staging",…}`.
4. Seed staging once from your machine with the staging **direct** URL, without saving it
   to a file:

   ```bash
   APP_ENV=staging DIRECT_URL='<staging direct url>' \
   SEED_ADMIN_PASSWORD='<choose>' SEED_USER_PIN='<choose>' pnpm db:seed
   ```

5. Production gets its first admin through a one-off script the identity lane will add;
   production is never seeded with demo data.

## Environment variables

| Variable                                             | Where                      | Purpose                                        |
| ---------------------------------------------------- | -------------------------- | ---------------------------------------------- |
| `DATABASE_URL`                                       | local `.env.local`, Vercel | Runtime connection (pooled on Neon)            |
| `DIRECT_URL`                                         | Vercel, optional locally   | Non-pooled connection used by `prisma migrate` |
| `APP_ENV`                                            | local, Vercel              | `local` / `staging` / `production`             |
| `DEV_AUTH_ROLE`                                      | local only                 | Dev sign-in bypass; ignored elsewhere          |
| `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | GitHub secrets             | Let Actions deploy                             |
| `STAGING_DOMAIN`                                     | GitHub variable            | Stable alias for the latest staging deploy     |
| `DEPLOY_ENABLED`                                     | GitHub variable            | `true` switches the deploy workflows on        |

Adding a variable: add it to `src/shared/lib/env.ts`, `.env.example`, this table, and to
Vercel for both environments — in the same PR that first reads it.

## Rollback

- **App:** Vercel dashboard → Deployments → previous production deployment → _Promote_.
- **Database:** migrations are forward-only. Fix with a new migration. For data loss, use
  Neon's point-in-time restore on the affected branch.
- A migration must work with the code that is live while it runs, so a rollback of the
  app after a migration is safe only when migrations are additive. Keep them additive.

## Troubleshooting

| Symptom                                  | Likely cause                                                                |
| ---------------------------------------- | --------------------------------------------------------------------------- |
| Deploy job fails at `vercel pull`        | Missing or expired `VERCEL_TOKEN`, wrong org/project id                     |
| Health check returns 401                 | Vercel Authentication still enabled                                         |
| Health check returns 503                 | `DATABASE_URL` missing or wrong for that Vercel environment                 |
| `migrate deploy` hangs or fails on Neon  | `DIRECT_URL` not set; the pooled URL was used for migrations                |
| Staging shows "not signed in" everywhere | Expected until the identity lane ships login — the dev bypass is local-only |
