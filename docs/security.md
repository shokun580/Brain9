# Security

What Brain9 defends, against whom, and the rules that follow for every lane and every AI
assistant. OWNER: infra (team lead). The short version of the rules is in the root
`AGENTS.md` §10; this is the canonical text.

"Secure" here means three things: the gaps we know about are closed, an attack costs the
attacker more than it is worth, and we notice quickly when one happens. No system is
unbreakable, and this document says plainly what we do not defend against.

**The repository is public.** Anyone can read the code, the route names, the limits and
this document. Nothing may depend on being hidden. A secret is something in an environment
variable, never something in the code.

## 1. What we protect

| Asset                                  | Why it matters                                                    |
| -------------------------------------- | ----------------------------------------------------------------- |
| Personal data of elderly people        | Name, phone number, birth date, gender, emergency contacts (PDPA) |
| Training results linked to a person    | May count as health-related sensitive data                        |
| PINs, passwords, sessions              | Whoever holds one acts as that person                             |
| The consent ledger and the audit trail | Evidence: what a person agreed to, and who read or changed what   |
| Seats at a center                      | A full schedule of fake bookings keeps real people out            |
| The ADMIN role                         | An ADMIN reads every person's data in every center                |
| The deploy pipeline and its secrets    | Whoever controls it replaces the application                      |
| The service being reachable            | An elderly person who cannot open the app stops training          |

## 2. Who might attack, and where they get in

| Who                                              | Where                                                                |
| ------------------------------------------------ | -------------------------------------------------------------------- |
| An anonymous visitor or a bot                    | Every public page and Server Action: sign-in, sign-up, forgotten PIN |
| A signed-in person, or someone using their phone | Any query or action that takes an id: "show me booking 123"          |
| Someone at a shared center device                | A session the previous person left open                              |
| Someone who phones staff pretending to be a user | The PIN reset                                                        |
| A compromised package or GitHub Action           | The build, with the deploy token in reach                            |
| Someone who takes over a team member's account   | A pull request, a merge, a deployment                                |

An ADMIN is trusted, and audited: we record what staff read and change; we do not prevent
it.

## 3. Threats and what stops them

| Threat                                           | Defence                                                                                                                      | Where                       |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Guessing a PIN                                   | 5 wrong attempts lock the number for 15 minutes; bcrypt; weak PINs refused                                                   | identity (#20, #21, #24)    |
| Flooding sign-in, sign-up or PIN reset           | Rate limit at the edge, counters in the application, refused before bcrypt                                                   | infra (#28), identity (#20) |
| Fake accounts filling a center's schedule        | An account never checked in holds one upcoming booking                                                                       | booking                     |
| Reading another person's data by changing an id  | Every query, action and route handler authorizes itself; an elderly person reads only their own rows                         | every lane                  |
| Injected script (XSS)                            | React escapes what it renders; no `dangerouslySetInnerHTML` in feature code; Content Security Policy                         | lint, `next.config.ts`      |
| The site framed by another site (clickjacking)   | `frame-ancestors 'none'`, `X-Frame-Options: DENY`                                                                            | `next.config.ts`            |
| A form on another site acting as the user (CSRF) | Server Actions accept only same-origin requests; the session cookie is `SameSite=Lax`; `form-action 'self'`                  | Next.js, identity           |
| A stolen session                                 | `HttpOnly`, `Secure` cookie; only its SHA-256 is stored; it expires; a PIN reset ends every session                          | identity (#19, #25, #26)    |
| SQL injection                                    | Prisma sends values as parameters; `$queryRawUnsafe` and `$executeRawUnsafe` are rejected                                    | lint                        |
| A PIN reset obtained by lying to staff           | Staff call the number registered on the account; only the browser that asked can set the PIN; every step is audited          | identity (#25, #26)         |
| A secret committed by mistake                    | GitHub secret scanning with push protection; secrets live only in environment variables                                      | repository settings         |
| A vulnerable or hijacked dependency              | Dependabot alerts and security updates; the `audit` job; actions pinned to a commit; no new dependency without the lead      | `.github/**`                |
| A vulnerable pattern in our own code             | CodeQL scans every pull request                                                                                              | repository settings         |
| A hijacked team account                          | Two-factor sign-in; `main` and `staging` accept only pull requests with passing checks; production deploys wait for the lead | repository settings         |
| A row removed by mistake or on purpose           | Nothing is physically deleted (soft delete only); ledgers are append-only                                                    | every lane                  |

## 4. What we do not defend against

- A sustained denial-of-service attack larger than the free hosting tiers absorb. The
  service stops; no data is exposed. `docs/deployment.md` says what the lead does.
- A break-in at Vercel, Neon, GitHub or Cloudflare themselves.
- An ADMIN who misuses their access. It is recorded, not prevented.
- A person's own unlocked phone, with a live session, in someone else's hands.
- Injected inline script, by policy alone. The Content Security Policy allows inline
  scripts (see §6), so the defence is React's escaping and the rules below.

## 5. Rules for every lane

Each rule can be checked by reading the diff. ESLint enforces the ones marked **(lint)**; a
passing lint does not prove the others.

**Entry points** — a page's data component, a query, a Server Action, a route handler

1. It authorizes itself with `getCurrentUser()`, `requireUser()` or `requireAdmin()`. A
   layout, a hidden button or a client-side check is not a security boundary.
2. It parses every input with a Zod schema on the server: form fields, JSON bodies, URL
   params, search params, and ids.
3. When it takes an id, it checks that the row belongs to the signed-in person (or that the
   person is an ADMIN) before reading or changing it. Not found and not allowed answer the
   same way: `notFound()` on a page, `fail("NOT_FOUND", …)` in an action.
4. An action open to a signed-out visitor runs in this order: validate → rate limit →
   database. Expensive work (bcrypt, a write) never runs for a refused request.
5. It returns an `ActionResult` with a Thai message written for the person. It never
   returns a caught error, a stack trace, a SQL message or an internal id that was not
   already theirs.
6. Messages about sign-in never reveal whether a phone number has an account.

**Data**

7. An elderly person reads only their own data. Only an ADMIN reads someone else's, and
   every such read or change calls `recordAudit()`.
8. Never log, return to the browser, or put in an error: PINs, passwords, hashes, session
   or device tokens, full phone numbers. (The one stated exception is in `AGENTS.md` §10.)
9. Nothing personal goes in a URL: no name, phone number or birth date in a path or a query
   string. Use the row's id.
10. Nothing personal or secret goes in `localStorage` or `sessionStorage`. The browser
    stores display preferences only.
11. Collect only the fields the schema defines.

**Browser**

12. No script, style, font or image from another host, and no request from the browser to
    another host. The Content Security Policy blocks them; a need for one is an `infra`
    issue.
13. No `dangerouslySetInnerHTML` in `src/app` or `src/modules`. **(lint)**
14. No `eval`, `new Function`, or timer given a string. **(lint)**
15. No `<iframe>`, `<object>` or `<embed>`.
16. A redirect goes to a fixed internal path, never to a URL taken from input.
17. A link to another site carries `rel="noopener noreferrer"`.

**Database**

18. Database access goes through `db` from `@/shared/lib/db`, with the Prisma query API or
    the tagged template (``db.$queryRaw`…` ``). No `$queryRawUnsafe` or
    `$executeRawUnsafe`, and no SQL assembled from strings. **(lint)**
19. No hard delete (root `AGENTS.md` §5). **(lint)**

**Secrets, cookies, dependencies**

20. Environment variables are read only through `env()` in `src/shared/lib/env.ts`. A new
    one is an `infra` issue. Nothing secret is committed, printed, or pasted into an issue,
    a pull request or a chat.
21. Only the identity lane sets or reads the session cookie. Any cookie that grants access
    is `HttpOnly`, `Secure` in production and `SameSite=Lax`, and only its hash is stored.
22. No new dependency, and no new version of one, without the lead (`AGENTS.md` §2).
23. Brain9 accepts no uploaded file today. A feature that needs one is an `infra` issue
    first.

## 6. The Content Security Policy

Every response carries the policy built in `src/shared/lib/security-headers.ts`:

```
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none';
base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
```

(`upgrade-insecure-requests` on staging and production only; the dev server also gets
`'unsafe-eval'` and `ws:`.) With it come `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
`Cross-Origin-Opener-Policy: same-origin` and a `Permissions-Policy` that switches off the
camera, microphone, geolocation, payment and USB.

Inline scripts and styles stay allowed on purpose. A stricter policy gives every inline
script a random nonce per request, which needs every page rendered on demand and, as the
Next.js guide states, is incompatible with Partial Prerendering. The lead chose to keep
the pages fast (2026-11-26). The hash-based alternative is experimental in this Next.js
version and is looked at again when it is stable. Until then rules 13 and 14 carry the
weight.

## 7. What runs automatically

| Tool                                   | When                          | A finding goes to                                  |
| -------------------------------------- | ----------------------------- | -------------------------------------------------- |
| Secret scanning with push protection   | Every push                    | The push is refused                                |
| ESLint security rules                  | `pnpm check`, CI `check`      | The author; CI fails                               |
| CodeQL                                 | Every pull request, weekly    | The pull request and the repository's Security tab |
| `audit` job                            | Every pull request            | A red check, not blocking; the lead decides        |
| Dependabot alerts and security updates | When an advisory is published | The lead                                           |

## 8. Security checklist for a pull request

- [ ] Every new query, action and route handler authorizes on the server
- [ ] Every input is parsed with Zod on the server, ids included
- [ ] An id from the request is checked against the signed-in person before use
- [ ] An ADMIN read or change of someone's data calls `recordAudit()`
- [ ] No sensitive value in a log, an error, a URL or browser storage
- [ ] No resource or request to another host; no raw HTML; no SQL from strings
- [ ] No new dependency, environment variable or cookie without the lead

## 9. When something looks wrong

- **A team member** who sees a vulnerability, a leaked secret, or data shown to the wrong
  person tells the lead at once, in the team's private chat. Do not describe it in an
  issue, a pull request or a commit message: the repository is public.
- **A leaked secret** is revoked first and investigated second. The lead rotates it where
  it was issued (Vercel, Neon, GitHub) and updates the environment variable.
- **Someone outside the team** follows [`SECURITY.md`](../SECURITY.md).
- **Under attack:** `docs/deployment.md` (the procedure arrives with issue #28).

## 10. Later rounds

Not built yet, in the order planned: a database role for the application with no right to
change the schema; a backup and restore drill; alerts when sign-in failures or errors
spike; a written incident procedure; a pass over the OWASP ASVS checklist once sign-in
exists; a real 404 for `/admin` (#17).
