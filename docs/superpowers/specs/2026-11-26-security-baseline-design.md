# Security baseline — design

Date: 2026-11-26 · Lane: infra · Decided with the team lead

## Why

Brain9 stores personal data and training results of elderly people, which may count as
health-related data. The lead wants the system hardened against attack before real users
arrive. "As secure as possible" is taken to mean: close the gaps we know about, make an
attack expensive, and notice quickly when one happens. This is the first round: the
measures that need no sign-in to exist and cost nothing.

## What a review found (2026-11-26)

Already in place: HTTPS with HSTS; GitHub secret scanning with push protection; a ruleset
on `main` and `staging` (pull request and CI required); production deploys need approval;
workflows run with read-only permissions; error screens show no internal message; the
lead's GitHub, Vercel, Neon and Cloudflare accounts all use two-factor sign-in.

Gaps:

1. No security headers except HSTS: the site can be framed by another site, and there is
   no Content Security Policy.
2. Dependabot and code scanning were off. (Turned on by the lead's decision on 2026-11-26:
   Dependabot alerts, Dependabot security updates, CodeQL default setup.)
3. One high advisory in `effect`, pulled in by Prisma's command-line tooling.
4. Workflow actions are referenced by tag, not by commit.
5. No written threat model and no single list of security rules for the five lanes and
   their AI assistants.

The repository is public. Route names, limits and thresholds are readable by anyone, so
nothing here may depend on being hidden.

## Goals

- Every response carries a Content Security Policy and the standard hardening headers.
- A compromised upstream action or package is harder to slip in, and a known-vulnerable
  package is reported to the lead automatically.
- One document tells every lane what we defend against and which rules follow from it.

## Non-goals (later rounds)

Least-privilege database roles; backup and restore drill; monitoring and alerts; an
incident procedure; a pass over the OWASP ASVS checklist once sign-in exists; the
application rate limits (#20), the edge rate limit (#28) and the real 404 for `/admin`
(#17), which already have issues.

## Anti-goals

- No measure that slows every page. Partial Prerendering stays on.
- No new runtime dependency and no paid service.
- No rule a lane cannot check for itself.

## Approaches to the Content Security Policy

| Approach                       | Protection                                         | Cost                                                                                          |
| ------------------------------ | -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Static policy, inline allowed  | Framing, foreign scripts and hosts, form hijacking | None: pages stay prerendered. Inline scripts are still allowed, because Next.js emits them    |
| Nonce per request              | The above, plus injected inline scripts            | Every page rendered on demand; Next.js documents it as incompatible with Partial Prerendering |
| Hashes (Subresource Integrity) | Close to the nonce policy, pages stay prerendered  | Experimental in Next.js; untested with this build                                             |

**Chosen by the lead: the static policy.** It keeps the framework defaults recorded in
`docs/decisions.md`. React escapes everything it renders, and the rules below forbid the
ways around that, so the remaining exposure is small. The hash approach is revisited when
Next.js marks it stable.

## Design

**1. Headers** — one pure function builds the header list; `next.config.ts` applies it to
every route. Values:

- `Content-Security-Policy`: `default-src 'self'`; `script-src 'self' 'unsafe-inline'`
  (plus `'unsafe-eval'` in development only); `style-src 'self' 'unsafe-inline'`;
  `img-src 'self' data: blob:`; `font-src 'self'`; `connect-src 'self'`;
  `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`; `frame-ancestors 'none'`;
  `upgrade-insecure-requests` (production builds only).
- `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`,
  `Cross-Origin-Opener-Policy: same-origin`,
  `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`.
- `poweredByHeader: false`. HSTS stays as Vercel sends it (no `includeSubDomains`: the
  parent domain has other sites).

Checked by unit tests on the function, by reading the headers of a production build, and
by opening every screen (including `/design` with its charts) with the browser console
showing no policy violation.

**2. Supply chain**

- Each `uses:` in the three workflows is pinned to a full commit SHA, with the version in a
  comment. `.github/dependabot.yml` keeps those pins current (weekly, GitHub Actions only).
- npm packages get security updates only (the repository setting); no routine version
  bumps, because a new dependency version needs the lead's approval.
- A CI job runs `pnpm audit --prod --audit-level high`. It reports; it is not added to the
  required checks, so an advisory in someone else's package cannot block four lanes.
- `effect` is raised to a patched version with a pnpm override if Prisma's tooling still
  works with it (generate, migrate, seed, build); otherwise the advisory is recorded as
  accepted, with the reason: it is in command-line tooling and takes no user input.

**3. Rules and threat model** — a new `docs/security.md`:

- what we protect, who might attack, where they can get in, and what we do not defend
  against;
- the rules for every lane, gathered from `AGENTS.md` and extended: no script, style, font
  or image from another host; no `dangerouslySetInnerHTML`, `eval` or inline event
  handler; no request from the browser to a third party; every entry point authorizes and
  validates on the server; rate limit before expensive work; nothing sensitive in logs,
  errors or URLs;
- a short security checklist for pull requests;
- who to tell when something looks wrong.

`AGENTS.md` gets the hard rules in a few lines and a pointer; `docs/ai/CHAT-CONTEXT.md`
gets the same lines; `SECURITY.md` at the root says how to report a vulnerability. ESLint
rejects `dangerouslySetInnerHTML` outside `src/shared`.

## Delivery

Three small pull requests into `staging`, each from its own branch: headers; supply chain;
documents and the lint rule.

## Left to the builder

The exact SHA of each action; the wording of `docs/security.md`; whether the `effect`
override holds.
