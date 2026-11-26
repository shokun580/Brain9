# Decision log

Short records of decisions that shape the code. Add a new entry at the top; do not rewrite
old ones — supersede them.

## 2026-11-27 — Sign-in screens: the entry chooser and the staff door (team lead)

Decided while reviewing the mock-ups for issue #27. Supersedes "Staff sign in on their own
page" in the 2026-11-26 entry below; everything else in that entry stands.

**`/login` is a chooser.** The first screen a signed-out person sees offers two things: sign
in or sign up. Each of the two flows then offers a way into the other. The phone and PIN
steps therefore move to `/login/pin` (the address is infra's call, so that signed-out
visitors keep landing on `/login` and sign-up can link straight to sign-in).

**Staff sign in with a username and a password, on a screen with the admin look.** Not with
a phone number, and not in the elderly look. The address is `/admin/login`. It is **not
linked from `/login`**: staff open the address themselves. A staff account is created only
from the menu inside the admin area; there is no sign-up for staff.

**A username** is 3 to 30 characters, starts with a letter, and uses lower-case letters,
digits, dot, hyphen and underscore. It is stored in lower case, so capitals typed at sign-in
make no difference. It lives in a new column `users.username`, empty for elderly accounts
and unique among live accounts. A staff account does not need a phone number, and a phone
number never signs staff in. (Decided 2026-11-27; issue #22 builds it.)

## 2026-11-26 — Sign-in, sign-up and abuse protection (team lead)

**No SMS anywhere.** The system sends no SMS and no OTP. Why: no provider is free beyond a
trial, sender names must be registered every year, and a flood of sign-ups would cost money
for every code sent. Consequences: a phone number is not verified at sign-up, and a PIN
reset is confirmed by a phone call from staff instead of a code sent by the system.

**PIN is exactly 4 digits.** `PinPad` submits on the last digit, so the length is one fixed
value. Four identical digits, `1234` and `4321` are refused. This closes open question 3.

**A forgotten PIN is reset online, after staff call back.** Brain9 is used at home as well
as at a center, so a reset must not need a visit. The person asks for a reset on the site
with their phone number. Staff see the request, call the number registered on the account,
and confirm that the person asked. Staff then press "allow a new PIN": every open session
of the account ends, and for 24 hours the browser that made the request is taken straight
to the screen where the person sets a new PIN on our own pad. Answering the registered
number is the proof of identity, the same proof an SMS code would give. The site answers a
request the same way whether or not the number has an account. Only the browser that asked
can set the PIN: knowing the phone number is not enough. Every approval, refusal and reset
is audited. The reset is one step ("prove who you are") followed by a fixed one ("set the
new PIN"), so another proof (LINE, SMS) can be added later without rebuilding it.

**At a center, staff can also reset a PIN with the person present:** the person types the
new PIN on the pad, so staff never learn it.

**Lockout.** Five wrong attempts for one phone number within 15 minutes block sign-in for
that number for 15 minutes, whether or not an account exists, so the message never reveals
that. Twenty failed attempts from one IP address within 15 minutes block that address the
same way.

**Sessions.** On a personal device a `USER` session lasts 30 days and is extended while it
is used. An `ADMIN` session lasts 12 hours and is not extended. Center devices get their own
rule with kiosk mode (open question 4).

_(Superseded on 2026-11-27: see the entry above.)_ **Staff sign in on their own page.** `/login/staff` (phone number and a password of 12 to
72 characters, typed with the keyboard), linked from `/login` as a small text link. An
admin's phone number entered on the elderly sign-in fails like any wrong PIN.

**Sign-up asks for the minimum.** Phone number → PIN (typed twice) → first and last name →
consent. Birth date, gender, emergency contact and home center are filled in later on the
profile screen. All three consents (`TERMS_OF_USE`, `PERSONAL_DATA`, `COGNITIVE_DATA`) are
required to create an account, each ticked separately and none pre-ticked: the service
cannot run without storing training results. Signing up with a number that already has an
account says so and points to sign-in; without SMS this cannot be hidden, so sign-up is
rate-limited instead.

**Abuse protection has three layers.**

1. Edge (infra): a rate-limit rule in the Vercel firewall on the sign-in and sign-up routes,
   and a written emergency procedure.
2. Application (identity): every sign-in and sign-up action runs validate → rate limit →
   database, so a refused request never reaches bcrypt. Counters live in PostgreSQL; no new
   dependency. At most five new accounts per IP address per hour; registered center devices
   will be exempt once kiosk mode exists.
3. Damage limit (booking): an account that has never been checked in at a center may hold
   one upcoming booking at a time. The first check-in lifts the limit: staff have then seen
   the person. An ADMIN can cancel bookings and suspend accounts.

A human check (CAPTCHA) on sign-up is held in reserve and added only if layers 1 and 2 are
not enough.

**The first production ADMIN** is created by a one-off, guarded script run by the lead.
After that, admins create admins on the admin users page.

## 2026-11-26 — Soft delete everywhere; erasure anonymises in place (team lead)

**Every table is soft-delete only.** Application code never physically deletes a row; it
sets `deleted_at`, and queries read `deleted_at IS NULL` by default. Why: results,
bookings, consents and audit entries all point at users, centers and content, so a hard
delete either fails or silently takes history with it (five relations used
`ON DELETE CASCADE`); a mistake by an admin must be recoverable; and four people with four
AI assistants need one rule that needs no judgement per table. Enforced by an ESLint rule
(`.delete()` / `.deleteMany()` on the Prisma client), by `ON DELETE RESTRICT` on the former
cascades, and by review. Unique rules whose value must be reusable (phone, center code,
device label, schedule template, time slot, level criterion) became partial unique indexes
over live rows. Table-by-table list: [`database.md`](database.md#soft-delete).

**Append-only ledgers are exempt.** `user_consents`, `audit_logs`, `item_results` and
`item_attempts` are evidence: inserted once, never updated (results: once completed) and
never removed, so they have no `deleted_at`.

**PDPA erasure overwrites personal fields and keeps the rows.** When a person asks for
erasure, the `users` row is anonymised and the personal fields of its `emergency_contacts`
are overwritten; no row is deleted. Why: it removes what identifies the person while every
foreign key and every aggregate statistic stays valid, and it keeps one rule ("nothing is
deleted") instead of an exception for emergency contacts. This supersedes "emergency
contacts are deleted on erasure" in the 2026-11-25 notes. Erasure is not a soft delete: an
anonymised user keeps `deleted_at = NULL`.

## 2026-11-25 — Foundation decisions (team lead)

**Stack.** One Next.js full-stack app (App Router, TypeScript), Prisma ORM, Neon
PostgreSQL, Vercel. Matches the technology section of all four reports.

**Branches.** Short-lived `feat/*` branches → pull request into `staging` → one release
pull request `staging` → `main` per sprint. The reports say "each module on its own
branch, merged by pull request at the end of each sprint"; short branches keep that
promise while avoiding one large merge per sprint.

**Deploys.** Vercel Hobby on the lead's account. GitHub Actions builds and deploys with
the Vercel CLI, so commits from every team member deploy without a paid team plan.

**Ownership.** One lane per module, enforced by CODEOWNERS; the lead owns infra and is
co-owner of every lane. Shared files are "hot files" changed only by the lead.

**Database.** Prisma with one schema file per lane. All 24 tables were designed up front
so module contracts are fixed before feature work starts.

**Login.** Phone number + PIN for elderly users; admins use a long password. (The identity
report describes length-based passwords; that policy applies to admins, and the report's
wording should be aligned.)

**Roles.** Only `USER` and `ADMIN`. No caregiver-to-person link; relatives are emergency
contacts.

**Centers.** Several centers are supported; every admin sees all of them.

**Center devices.** An admin registers and approves a shared device once, recording
detailed device information. On such a device: anyone can log in, nothing is remembered,
sessions end automatically, training is tagged with the center, training needs a booking
for the current slot, and walk-in sign-up is possible.

**Booking.** A booking reserves a seat in a time slot, not a device. Opening hours are a
weekly template plus special closures. One booking per user per day.

**Courses.** Every published course is open to everyone. The system recommends the next
exercise; it never locks content.

**Privacy.** Sign-up records consent to the privacy notice and terms with version and
time; consent can be withdrawn; users can request access and erasure. Erasure anonymises.

**Profile data.** Name, phone, birth date, gender, emergency contact, home center.

**Docs.** English for all repository documentation and code; Thai for user-facing text.

**Task tracking.** GitHub Issues + Projects.

**Framework defaults kept.** Next.js Cache Components and Partial Prefetching stay
enabled (the framework's direction; both become mandatory in the next major version).
Prisma stays on 7.x while 8 is a release candidate.

## Open questions

| #   | Question                                                                   | Owner                         |
| --- | -------------------------------------------------------------------------- | ----------------------------- |
| 1   | Real thresholds for Performance Levels 1–4                                 | analytics + Requirement Owner |
| 2   | Final text of the privacy notice and terms of use                          | identity                      |
| 3   | ~~PIN length and lockout policy~~ — decided 2026-11-26 (see above)         | identity                      |
| 4   | Idle timeout on center devices                                             | identity                      |
| 5   | How far ahead time slots are generated and bookable                        | booking                       |
| 6   | Is "one booking per day" per center or across all centers (currently: all) | booking                       |
| 7   | Meaning of difficulty levels 1–5 in terms of sequence length and timing    | content                       |
| 8   | Data retention period for results of inactive accounts                     | lead                          |
| 9   | On erasure, also clear IP / user agent on the person's `auth_sessions`?    | lead + identity               |
| 10  | On erasure, keep a coarse birth year / gender for statistics? (now: no)    | lead + analytics              |
| 11  | How many upcoming bookings a checked-in account may hold at once           | booking                       |
