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

### 1. Vercel project

```bash
vercel login
cd Brain9
vercel project add brain9
vercel link --yes --project brain9     # do NOT connect a Git repository
```

Framework (Next.js), function region (`sin1`) and Node version (24.x) are pinned in
`vercel.json` and `package.json`, so the project's dashboard defaults do not matter.

In the dashboard → **Settings → Deployment Protection → Vercel Authentication: off**
(otherwise the staging URL asks teammates to log in to Vercel and the health check fails).

### 2. Neon database (through Vercel)

The lead's Neon organisation is managed by Vercel, so databases are created from Vercel,
not in the Neon console (the console answers "organization is managed by Vercel").

1. Vercel dashboard → project `brain9` → **Storage** → **Create Database** → **Neon**.
   Region: Singapore. Plan: Free. Name: `brain9`.
2. When asked which environments to connect, tick **Production only**. Leave Preview and
   Development unticked and the prefix empty. Vercel now manages `DATABASE_URL` (pooled)
   and `DATABASE_URL_UNPOOLED` (direct) for production.
3. **Open in Neon** → **Branches**. The default branch (`main` or `production`) is the
   production data. Create:
   - `staging` from the default branch
   - `dev/apinan`, `dev/chanon`, `dev/supanat`, `dev/saruta` from `staging`
     (the free plan allows 10 branches)
4. In Neon, **Connect** → branch `staging` → copy the **pooled** string (host contains
   `-pooler`) and the **direct** string.
5. Vercel → **Settings → Environment Variables**, add by hand:

   | Variable                | Environment | Value                  |
   | ----------------------- | ----------- | ---------------------- |
   | `DATABASE_URL`          | Preview     | Neon `staging`, pooled |
   | `DATABASE_URL_UNPOOLED` | Preview     | Neon `staging`, direct |
   | `APP_ENV`               | Preview     | `staging`              |
   | `APP_ENV`               | Production  | `production`           |

6. Send each developer the pooled string of their own `dev/*` branch privately.

Result:

| Variable                | Production                                               | Preview (staging)      |
| ----------------------- | -------------------------------------------------------- | ---------------------- |
| `DATABASE_URL`          | Neon default branch, pooled (managed by the integration) | Neon `staging`, pooled |
| `DATABASE_URL_UNPOOLED` | Neon default branch, direct (managed by the integration) | Neon `staging`, direct |
| `APP_ENV`               | `production`                                             | `staging`              |

### 3. Domains

`brain9.ast0miq.com` is attached to the project as the production domain
(`vercel domains add brain9.ast0miq.com brain9`).

| Environment | Domain                       | How it is routed                                                                                                                 |
| ----------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Production  | `brain9.ast0miq.com`         | Project domain; every production deploy serves it                                                                                |
| Staging     | `staging.brain9.ast0miq.com` | Not a project domain. The staging workflow points it at the newest staging deployment with `vercel alias set` (`STAGING_DOMAIN`) |

The staging domain must **not** be added to the project: project domains follow
production, so staging would start serving the production build.

DNS records in Cloudflare (zone `ast0miq.com`):

| Type  | Name             | Target                 | Proxy status          |
| ----- | ---------------- | ---------------------- | --------------------- |
| CNAME | `brain9`         | `cname.vercel-dns.com` | DNS only (grey cloud) |
| CNAME | `staging.brain9` | `cname.vercel-dns.com` | DNS only (grey cloud) |

Keep both records on **DNS only**. Vercel issues and renews the TLS certificates itself,
and Cloudflare's free certificate does not cover a two-level name such as
`staging.brain9.ast0miq.com`, so proxying that record breaks HTTPS.

Check with `vercel domains verify brain9.ast0miq.com`.

### 4. GitHub secrets and variables

`vercel link` wrote `.vercel/project.json` (git-ignored) containing `orgId` and
`projectId`. Create a Vercel token at <https://vercel.com/account/tokens>.

```bash
gh secret set VERCEL_TOKEN          # paste the token when prompted
gh secret set VERCEL_ORG_ID         # orgId from .vercel/project.json
gh secret set VERCEL_PROJECT_ID     # projectId from .vercel/project.json
gh variable set STAGING_DOMAIN --body "staging.brain9.ast0miq.com"
gh variable set DEPLOY_ENABLED --body true      # do this last: it switches the deploy workflows on
```

Until `DEPLOY_ENABLED` is `true` the deploy jobs are skipped, so merging before the setup
is finished does not produce failed runs.

### 5. Branch ruleset

`main` and `staging` are protected by one repository ruleset, created by hand at
**Settings → Rules → Rulesets → New branch ruleset**:

| Field              | Value                                                         |
| ------------------ | ------------------------------------------------------------- |
| Ruleset name       | `protect-main-and-staging`                                    |
| Enforcement status | **Disabled** while bootstrapping, **Active** after step 6     |
| Bypass list        | **Repository admin**, allowed for pull requests only          |
| Target branches    | _Include default branch_, plus _Include by pattern_ `staging` |

Rules to enable:

- **Restrict deletions**
- **Block force pushes**
- **Require a pull request before merging** — required approvals `1`, dismiss stale
  approvals, require review from Code Owners, require conversation resolution; allowed
  merge methods: merge and squash
- **Require status checks to pass** — checks `target-guard`, `check`, `migrations`
  (source: GitHub Actions); tick **Do not require status checks on creation**

Leave everything else off. The ones that look tempting but break this workflow:

| Setting                                             | Why it stays off                                                                                                                                                                  |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Restrict updates                                    | Blocks every merge                                                                                                                                                                |
| Restrict creations                                  | Stops the `staging` branch from being created                                                                                                                                     |
| Require linear history                              | Rejects the release pull request, which uses a merge commit                                                                                                                       |
| Require branches to be up to date before merging    | The release merge commit exists only on `main`, so every later `staging` → `main` pull request would be "out of date" and could only be updated by pushing to protected `staging` |
| Require approval of the most recent reviewable push | When a reviewer pushes a small fix to someone's pull request, neither the reviewer nor the author can approve it, and a four-person team runs out of approvers                    |

The admin bypass exists because the lead cannot approve their own pull requests; use it
only for that.

Optional, for stricter `staging`: a second ruleset `staging-up-to-date` targeting only
`staging` with a single rule — _Require status checks to pass_ with the same three checks
and _Require branches to be up to date_ ticked. Rulesets add up, so `staging` then needs
an up-to-date branch while `main` does not.

### 6. Staging branch, labels, environments

Do these in order:

1. Merge the infrastructure pull request into `main`. The `target-guard` check starts
   rejecting pull requests into `main` from other branches as soon as `staging` exists,
   so `staging` must not exist yet.
2. Run the setup script:

   ```bash
   ./scripts/setup-github.sh
   ```

   It (read it first) sets the merge options, creates the `staging` branch from `main`,
   the labels, and the `staging` and `production` environments (production requires your
   approval). It does not touch branch rules; it only reports whether an active ruleset
   exists.

3. Switch the ruleset from step 5 to **Active**. Doing this after `staging` exists avoids
   the pull-request rule getting in the way of creating the branch.

### 7. Project board

Create a GitHub Project (board layout) named "Brain9", add the columns from
`docs/workflow.md`, and link the repository.

### 8. First deploy

1. Finish steps 1–6 above.
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

| Variable                                             | Where                      | Purpose                                                                                       |
| ---------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                       | local `.env.local`, Vercel | Runtime connection (pooled on Neon)                                                           |
| `DATABASE_URL_UNPOOLED`                              | Vercel                     | Non-pooled connection used by `prisma migrate` and the seed; provided by the Neon integration |
| `DIRECT_URL`                                         | optional, anywhere         | Same purpose under our own name; wins over `DATABASE_URL_UNPOOLED` when both are set          |
| `APP_ENV`                                            | local, Vercel              | `local` / `staging` / `production`                                                            |
| `DEV_AUTH_ROLE`                                      | local only                 | Dev sign-in bypass; ignored elsewhere                                                         |
| `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | GitHub secrets             | Let Actions deploy                                                                            |
| `STAGING_DOMAIN`                                     | GitHub variable            | Stable alias for the latest staging deploy                                                    |
| `DEPLOY_ENABLED`                                     | GitHub variable            | `true` switches the deploy workflows on                                                       |

Adding a variable: add it to `src/shared/lib/env.ts`, `.env.example`, this table, and to
Vercel for both environments — in the same PR that first reads it.

## Deploying by hand

Normally nobody does: the workflows deploy. If the lead ever has to deploy from a laptop,
two things go wrong easily:

- **Name the environment.** `vercel deploy --prebuilt` with no environment made the very
  first deployment of this project a production one. Use `--environment=preview` for
  staging (`--target=preview` on CLI versions before 66) and `--prod` for production, and
  check `vercel inspect <url>` before aliasing a domain.
- **Name the team when aliasing.** `vercel alias set <url> <domain>` needs
  `--scope <team id>` when it runs with the team-scoped token; without it the API answers
  "User not found".
- **No `.env*` files in the project folder while building.** The build output references
  files named `.env*` that sit in the folder (seen with `.env.example` and with a renamed
  backup of `.env.local`), so treat any such file as something that may be uploaded with
  the deployment. Move `.env.local` out of the folder first; the workflows never have one.

## Rollback

- **App:** Vercel dashboard → Deployments → previous production deployment → _Promote_.
- **Database:** migrations are forward-only. Fix with a new migration. For data loss, use
  Neon's point-in-time restore on the affected branch.
- A migration must work with the code that is live while it runs, so a rollback of the
  app after a migration is safe only when migrations are additive. Keep them additive.

## Troubleshooting

| Symptom                                  | Likely cause                                                                                        |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Deploy job fails at `vercel pull`        | Missing or expired `VERCEL_TOKEN`, wrong org/project id                                             |
| Health check returns 401                 | Vercel Authentication still enabled                                                                 |
| Health check returns 503                 | `DATABASE_URL` missing or wrong for that Vercel environment                                         |
| `migrate deploy` hangs or fails on Neon  | `DATABASE_URL_UNPOOLED` missing for that Vercel environment; the pooled URL was used for migrations |
| Staging shows "not signed in" everywhere | Expected until the identity lane ships login — the dev bypass is local-only                         |
