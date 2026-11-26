# Lane: identity — users, login, roles, privacy, centers, devices

**Owner:** Chanon (66160347) · `@chanon-max` · Read the root [`AGENTS.md`](../../../AGENTS.md) first.

Every other module depends on this one: it answers "who is this, and what may they do?".

## You own

| Area        | Paths                                                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Module code | `src/modules/identity/**`                                                                                                                                                                  |
| Schema      | `prisma/schema/identity.prisma`, `prisma/schema/centers.prisma`                                                                                                                            |
| Routes      | `src/app/(auth)/**`, `src/app/(elder)/profile/**`, `src/app/admin/users/**`, `src/app/admin/centers/**`, `src/app/admin/devices/**`, `src/app/admin/privacy/**`, `src/app/api/identity/**` |
| Tables      | `users`, `emergency_contacts`, `auth_sessions`, `policy_documents`, `user_consents`, `data_subject_requests`, `audit_logs`, `centers`, `center_devices`                                    |

`src/proxy.ts` (Next.js 16 "proxy", formerly middleware) is an infra file: when you need the
optimistic "has a session cookie?" redirect, open an `infra` issue with the code you want.

## Public API other lanes rely on (`index.ts`)

Already exported — **keep these signatures stable**:

- `getCurrentUser(): Promise<CurrentUser | null>` — currently a stub with a local-only dev
  bypass (`DEV_AUTH_ROLE`). Replace its body with the real session lookup.
- `requireUser()` — redirects a signed-out visitor to `/login`.
- `requireAdmin()` — answers `notFound()` to anyone who is not an ADMIN, signed in or not.
  It never redirects: a redirect would reveal that the route exists (root `AGENTS.md`,
  "System screens").
- `recordAudit(entry)` — append to `audit_logs`.
- `CurrentUser` = `{ id, role, firstName, lastName, context, centerId, deviceId }`.

To add: sign-up, login, logout, consent, device registration (as Server Actions returning
`ActionResult`), and `getCenterDeviceContext()` for the booking and engine lanes.

## Domain rules already decided (team lead, 2026-11-25 and 2026-11-26)

**Login**

- Identifier is the phone number (digits only, unique among accounts that are not
  soft-deleted — a partial unique index, so find a user with
  `findFirst({ where: { phone, ...notDeleted } })`; there is no `findUnique` on `phone`).
  Elderly users use a PIN of exactly 4 digits (four identical digits, `1234` and `4321`
  are refused); admins use a password of 12 to 72 characters. Both are stored as bcrypt
  hashes in `credential_hash`.
- `/login` is a chooser: sign in (to `/login/pin`) or sign up (to `/signup`). Elderly people
  sign in at `/login/pin` with `PhonePad` then `PinPad` (recipe "Elderly sign-in steps" in
  `docs/design-system.md`). An admin's phone number entered there fails like any wrong PIN.
- Staff sign in at `/admin/login` with a username and a password typed on the keyboard, on a
  screen with the admin look (recipe "Staff sign-in"). `/login` does not link to it and
  there is no sign-up for staff: a staff account is created from the admin area.
- A username is 3 to 30 characters, starts with a letter, and uses lower-case letters,
  digits, dot, hyphen and underscore (`^[a-z][a-z0-9._-]{2,29}$` after trimming and
  lower-casing). It is stored in `users.username`, empty for elderly accounts and unique
  among live accounts through a partial unique index, so find staff with
  `findFirst({ where: { username, ...notDeleted } })`. A staff account needs no phone number.
- Lockout: 5 wrong attempts for one phone number (or, for staff, one username) within 15
  minutes block it for 15 minutes, whether or not an account exists; 20 failed attempts
  from one IP address within 15 minutes block that address. Also keep `failed_login_count` / `locked_until` on
  a real account so staff can see it. Messages must not reveal whether a phone number
  or a username exists; a suspended account is named only after the correct PIN.
- Session = random token in an HttpOnly, Secure, SameSite=Lax cookie (`brain9_session`);
  the database stores only its SHA-256 (`auth_sessions.token_hash`). Lifetime on a personal
  device: `USER` 30 days, extended while in use; `ADMIN` 12 hours, not extended.
- There is no SMS and no OTP. A forgotten PIN is reset online after a call-back: the
  person asks on `/login/forgot`; an ADMIN calls the number registered on the account and,
  once sure, allows a new PIN; every open session of the account ends; for 24 hours the
  browser that asked is taken to the screen where the person sets a new PIN on `PinPad`.
  The request answers the same way whether or not the number has an account, and only the
  browser that asked (a cookie whose SHA-256 is stored) can set the PIN. Every approval,
  refusal and reset is audited.
- At a center an ADMIN can also reset a PIN with the person present: the person types the
  new PIN on `PinPad`, staff never see it.

**Sign-up** — phone number → PIN typed twice → first and last name → consent, nothing
else; the rest of the profile is filled in later. A number that already has an account is
told so and pointed to sign-in.

**Abuse protection** — every sign-in and sign-up action runs in this order: validate with
Zod → rate limit → database. A refused request must not reach bcrypt. Counters live in
PostgreSQL (no new dependency). At most 5 new accounts per IP address per hour; registered
center devices become exempt with kiosk mode. The edge rate limit is infra's.

**Roles** — exactly two: `USER` (elderly) and `ADMIN` (caregiver / center staff). There is
no per-person caregiver link. Every ADMIN sees every center. A relative is stored only as
an emergency contact.

**Profile fields** — first/last name, phone, birth date, gender, emergency contact(s),
home center. Nothing else without the lead's approval (PDPA data minimisation).

**PDPA**

- Sign-up shows the privacy notice and terms in large, plain Thai. Consent checkboxes are
  never pre-ticked. Each acceptance inserts a `user_consents` row with the exact
  `policy_documents` version, time, context and device. All three purposes
  (`TERMS_OF_USE`, `PERSONAL_DATA`, `COGNITIVE_DATA`) are required to create an account,
  each ticked separately.
- Withdrawing consent inserts a `WITHDRAWN` row (the ledger is append-only) and must be as
  easy as granting it. Withdrawing `COGNITIVE_DATA` stops analytics for that user;
  withdrawing `PERSONAL_DATA` or `TERMS_OF_USE` ends the sessions and starts an erasure request.
- Users can view their stored data, correct it, and request erasure
  (`data_subject_requests`, due within 30 days).
- **Erasure** = anonymise the `users` row and overwrite the personal fields of its
  `emergency_contacts`; no row is deleted (root `AGENTS.md` §5, decided 2026-11-26). In one
  transaction, after ending the person's open `auth_sessions`, overwrite exactly:

  | Table                | Column                                   | Becomes                                                |
  | -------------------- | ---------------------------------------- | ------------------------------------------------------ |
  | `users`              | `phone`                                  | `NULL`                                                 |
  | `users`              | `first_name`, `last_name`                | one fixed placeholder, never derived from the old name |
  | `users`              | `birth_date`, `gender`, `home_center_id` | `NULL`                                                 |
  | `users`              | `credential_hash`, `locked_until`        | `NULL`                                                 |
  | `users`              | `failed_login_count`                     | `0`                                                    |
  | `users`              | `status`                                 | `ANONYMIZED`                                           |
  | `users`              | `anonymized_at`                          | now                                                    |
  | `emergency_contacts` | `name`                                   | the same fixed placeholder                             |
  | `emergency_contacts` | `relationship`                           | `NULL`                                                 |
  | `emergency_contacts` | `phone`                                  | `''` (the column is NOT NULL)                          |

  Overwrite every `emergency_contacts` row of the user, including soft-deleted ones. Leave
  `deleted_at` alone on both tables: erasure is not a soft delete, and the anonymised user
  must stay visible to aggregate statistics. Never touch `user_consents` or `audit_logs`
  (append-only); record the erasure with `recordAudit()` without copying the old values.
  The action itself is on this lane's backlog (step 5 below).

- Nothing in this lane is hard-deleted: removing an emergency contact, a center, a device
  or an account sets `deleted_at`; signing out sets `auth_sessions.ended_at`.
- Any ADMIN read or change of someone else's data calls `recordAudit()`.

**Center devices (kiosk mode)**

- The login page has a "ตั้งเป็นเครื่องที่ศูนย์" entry. An ADMIN must authenticate, pick the
  center and fill in the device details: label, type, brand, model, serial/asset tag,
  OS, screen size, purchase year, plus auto-captured `maxTouchPoints`, screen size in px
  and user-agent. Who registered/approved and when are recorded.
- Approval sets `status = ACTIVE` and stores a device token cookie (hash in
  `device_token_hash`). Revoking clears it.
- On an ACTIVE center device:
  1. anyone can still log in (it is shared) and walk-in sign-up is allowed;
  2. the phone number is never remembered and the session ends on idle and at slot end;
  3. sessions and training are tagged `context = CENTER` with the center and device;
  4. training requires an active booking for the current slot at that center (ask the
     booking lane's API); signing up and booking do not. Logging in checks the booking in.

## Depends on

- `booking` — "does this user have an active booking right now at this center?" and the
  check-in call. Agree the signature in a cross-module issue.

## Work map

Every line becomes one GitHub issue with acceptance criteria; work on a line only through
its issue. Phase A is written out in full. Later phases are outlines: their issues are
written at sprint planning, after the open questions they depend on are decided
(`docs/decisions.md`). Do not start an outline line from this list alone.

**Phase A — sign-in, sign-up and forgotten PIN** (unblocks every lane; do these first, in
this order)

| Key  | Issue | What exists when it is done                                                                             | Needs            |
| ---- | ----- | ------------------------------------------------------------------------------------------------------- | ---------------- |
| ID-1 | #19   | Real sessions: `getCurrentUser()` reads a session; create and end a session                             | —                |
| ID-2 | #20   | Rate-limit counters for sign-in, sign-up and PIN reset, as a pure rule                                  | —                |
| ID-3 | #21   | Elderly sign-in: the `/login` chooser and the steps at `/login/pin` (phone + PIN), lockout              | ID-1, ID-2       |
| ID-4 | #22   | Staff sign-in on `/admin/login` (username + password), the `users.username` column                      | ID-1, ID-2, ID-3 |
| ID-5 | #23   | Sign-out for elderly people and for staff                                                               | ID-1             |
| ID-6 | #24   | Sign-up with consent on `/signup`                                                                       | ID-3             |
| ID-7 | #25   | Forgotten PIN, the person's side: ask for a reset on `/login/forgot`, set a new PIN once staff allow it | ID-3, ID-6       |
| ID-8 | #26   | Forgotten PIN, the staff side: the request list in the admin area, allow or refuse after calling back   | ID-4, ID-7       |

The recipes for all of these screens are in `docs/design-system.md` §5 ("Elderly sign-in
steps", "Staff sign-in", "Elderly sign-up steps", "Forgotten PIN screens", "Elderly profile
and sign-out"): build each screen from its recipe and nothing else.

**Phase B — staff manage accounts** (outline)

| Key   | What exists when it is done                                                 |
| ----- | --------------------------------------------------------------------------- |
| ID-9  | Admin user list with search; every read of a person is audited              |
| ID-10 | Admin user detail: suspend and reactivate an account, change its role       |
| ID-11 | An ADMIN creates an account for a walk-in elderly person or for a new ADMIN |
| ID-12 | PIN reset by staff with the person present (the person types the new PIN)   |
| ID-13 | `getUserDisplay(userIds)` for admin lists in other lanes (audited)          |

**Phase C — centers and center devices** (outline)

| Key   | What exists when it is done                                                                                                                                                                                                   |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID-14 | Centers: list, create, edit, remove (soft delete)                                                                                                                                                                             |
| ID-15 | Center device: register from the login page, approve, revoke                                                                                                                                                                  |
| ID-16 | Kiosk mode on an ACTIVE device: `CENTER` sessions, nothing remembered, sign-out on idle and at slot end, `getCenterDeviceContext()`, check-in through the booking lane, walk-in sign-up, and the sign-up rate-limit exemption |

**Phase D — profile and privacy** (outline)

| Key   | What exists when it is done                                                                                                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ID-17 | Profile: after sign-up a person is invited to fill in the rest (birth date, gender, emergency contact, home center), and can view and correct it later |
| ID-18 | Consent: view what was accepted, withdraw it; `hasActiveConsent(userId, purpose)`                                                                      |
| ID-19 | A person files a data-subject request (access, rectification, erasure)                                                                                 |
| ID-20 | Admin privacy page: the request queue, and erasure (the anonymise table above)                                                                         |
| ID-21 | Policy documents: publish a new version; the reviewed text of the notice and the terms                                                                 |

ID-17 is the first outline to write out after Phase A: sign-up asks for the minimum, and
staff use the birth date and home center to confirm who they are calling back (ID-8).

Not decided, so not on the map: whether a person can change their own PIN from the profile
screen.
