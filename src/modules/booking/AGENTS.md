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
