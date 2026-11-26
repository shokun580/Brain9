# Lane: booking — schedules, time slots, seat bookings

**Owner:** Chanon (66160347) · `@chanon-max` · Read the root [`AGENTS.md`](../../../AGENTS.md) first.

Lets elderly users without a device at home reserve a seat at a community center.

## You own

| Area        | Paths                                                                                                            |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| Module code | `src/modules/booking/**`                                                                                         |
| Schema      | `prisma/schema/booking.prisma`                                                                                   |
| Routes      | `src/app/(elder)/booking/**`, `src/app/admin/schedule/**`, `src/app/admin/bookings/**`, `src/app/api/booking/**` |
| Tables      | `schedule_templates`, `schedule_exceptions`, `time_slots`, `bookings`                                            |

## Domain rules already decided (team lead, 2026-11-25)

- A booking reserves **a seat in a time slot**, not a specific device. Slot capacity is the
  number of usable devices at the center.
- Admins define opening hours as a **weekly template** (`schedule_templates`: day of week,
  start/end minute, capacity). Concrete `time_slots` are generated ahead (e.g. 4 weeks)
  in the center's time zone. Special closures are `schedule_exceptions`.
- **No double booking, no overbooking — enforced in the database:**
  - partial unique index: one ACTIVE booking per (slot, user)
  - partial unique index: one ACTIVE booking per (user, day)
  - `CHECK (booked_count <= capacity)` on `time_slots`
  - Book inside one transaction:
    `UPDATE time_slots SET booked_count = booked_count + 1 WHERE id = $1 AND status = 'OPEN' AND booked_count < capacity`
    — zero rows updated means the slot is full; then insert the booking. Cancelling
    decrements in the same way. Catch unique-violation errors and return
    `fail("CONFLICT", …)` with a friendly Thai message.
- Statuses: `BOOKED → CHECKED_IN → COMPLETED`, or `CANCELLED`, or `NO_SHOW`.
  Sources: `SELF`, `ADMIN`, `WALK_IN` (admin adds a walk-in when a seat is free).
- Elderly users see only their own bookings. Admins see the day list for any center.
- **Damage limit against fake accounts (team lead, 2026-11-26):** an account that has never
  been checked in at a center may hold one upcoming ACTIVE booking at a time, across all
  centers. Its first `CHECKED_IN` booking lifts the limit, because staff have then seen the
  person. Refuse the second booking with `fail("CONFLICT", …)` and a friendly Thai message
  that says to come to the first visit before booking the next. Keep the rule as a pure
  function with unit tests. How many upcoming bookings a checked-in account may hold is
  open question 11 in `docs/decisions.md`.

## Public API to provide (`index.ts`)

- `listAvailableSlots(centerId, from, to)`
- `createBookingAction`, `cancelBookingAction`
- `getActiveBookingForNow(userId, centerId)` and `checkInBooking(bookingId, deviceId)` —
  called by identity when someone logs in on a center device
- `listBookingsForDay(centerId, date)` — admin

## Depends on

- `identity` — `getCurrentUser()`, `requireAdmin()`, `recordAudit()`, centers.

## Must be unit-tested

Slot generation from templates + exceptions (including time-zone handling), and the
booking rules as pure functions.

## Work map

Every line becomes one GitHub issue with acceptance criteria; work on a line only through
its issue. These are outlines: the issues are written at sprint planning, after identity's
Phase A (`src/modules/identity/AGENTS.md`) and after open questions 5, 6 and 11 in
`docs/decisions.md` are decided. Do not start a line from this list alone. BK-1 is pure
logic and can start at any time.

| Key  | What exists when it is done                                                                                                                                               | Needs             |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| BK-1 | Slot rules as pure functions: slots from a weekly template and its exceptions, in the center's time zone; the booking rules (one per slot, one per day, the damage limit) | —                 |
| BK-2 | Admin schedule: the weekly template of a center (list, add, edit, switch off)                                                                                             | ID-1              |
| BK-3 | Admin schedule exceptions: a closure, or a day with a different capacity                                                                                                  | BK-2              |
| BK-4 | Slots are generated ahead from the template (how far: open question 5)                                                                                                    | BK-1, BK-2, infra |
| BK-5 | `listAvailableSlots()` and the elderly booking screen: choose a slot and book it                                                                                          | BK-4, ID-3        |
| BK-6 | Elderly "my bookings": see them and cancel one                                                                                                                            | BK-5              |
| BK-7 | Admin day list of a center: who is coming, add a walk-in, cancel, mark a no-show                                                                                          | BK-5              |
| BK-8 | `getActiveBookingForNow()` and `checkInBooking()` for identity's kiosk mode (ID-16), agreed in a cross-module issue; a checked-in booking becomes `COMPLETED` at slot end | BK-5              |

BK-4 needs something that runs on a schedule; that is an `infra` issue (`vercel.json` is a
hot file). The booking screens need recipes the design system may not have yet: check
`docs/design-system.md` first and open an `infra` issue for what is missing.
