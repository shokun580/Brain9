# Decision log

Short records of decisions that shape the code. Add a new entry at the top; do not rewrite
old ones — supersede them.

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
| 3   | PIN length (4 or 6 digits) and lockout policy                              | identity                      |
| 4   | Idle timeout on center devices                                             | identity                      |
| 5   | How far ahead time slots are generated and bookable                        | booking                       |
| 6   | Is "one booking per day" per center or across all centers (currently: all) | booking                       |
| 7   | Meaning of difficulty levels 1–5 in terms of sequence length and timing    | content                       |
| 8   | Data retention period for results of inactive accounts                     | lead                          |
