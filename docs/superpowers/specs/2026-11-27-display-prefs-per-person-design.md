# Display settings per person — design

Date: 2026-11-27 · Lane: infra (with a cross-module request to identity) · Decided with the
team lead

## Why

Text size (1, 2, 3) and high contrast are remembered per device today, in `localStorage`
under `brain9.display`, and nowhere on the server. On a shared tablet at a center the next
person inherits the previous person's settings, and the same person on another device
starts from the default. The lead decided the settings belong to the person.

## Goals

- A person's text size and contrast follow their account to every device.
- A device with nobody signed in shows the default, whoever used it last.
- A reload never flashes the wrong size.
- Nothing regresses before identity's part lands: until then the setting keeps working on
  the device.

## Not goals

- No control for the settings on the screens before sign-in.
- No admin screen shows or changes another person's settings.
- The admin look keeps ignoring both settings.
- Kiosk mode (ID-16) is not needed and not touched.

## Decisions (team lead, 2026-11-27)

| #   | Question                             | Decision                                                                                             |
| --- | ------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| 1   | Where the value lives                | Two columns on `users`, owned by identity; identity exports a query and a Server Action              |
| 2   | A device after sign-out              | Back to the default, on every device (personal or shared)                                            |
| 3   | The screens before sign-in           | Always the default                                                                                   |
| 4   | Device value against account value   | The account always wins; an account that never chose has the default (columns `NOT NULL` + default)  |
| 5   | Reaching `<html>` before first paint | `localStorage` stays as the device's copy of the signed-in person's value; the inline script is kept |

Decisions 2 and 3 are one rule: **signed out means default**.

## Approaches considered

**Storage.** (a) Columns on `users` — chosen: one value per person, no soft-delete or
uniqueness question, and PDPA erasure overwrites the same row. (b) A table of infra's own
(`user_display_preferences`) — rejected: a 25th table for two values, with `deleted_at`, a
partial unique index, a back-relation identity approves anyway, and one more table for
erasure to overwrite.

**Before first paint.** (a) Keep `localStorage` + the inline script as a copy — chosen: no
new cookie, no dependency, already allowed by `docs/security.md` rule 10. (b) A cookie the
script can read — rejected: a new cookie sent with every request, and more work tied to
identity's sign-in. (c) Render the attributes on the server — not possible: the root
layout is static under Cache Components and cannot read the session.

**Clearing at sign-out.** (a) The layout of the signed-out screens clears the device —
chosen: one place covers every way a session ends (sign-out, expiry, idle, revoked, PIN
reset), and identity has nothing to remember. (b) Each sign-out path clears it — rejected:
several paths in another lane, and an expired session never runs any of them.

## How it works

```
account (users.display_size, users.display_high_contrast)
   │  getDisplayPrefs()                    ▲  saveDisplayPrefsAction(prefs)
   ▼                                       │
(elder) layout ─ DisplayPrefsSync      DisplaySettings dialog
   │ on mount: apply to <html>,            │ on change: apply to <html>,
   │ copy to localStorage                  │ copy to localStorage, save to account
   ▼                                       ▼
localStorage "brain9.display"  ──►  inline script sets <html> before first paint (reloads)

(auth) layout ─ DisplayPrefsReset: remove the copy and the attributes (signed out = default)
```

**Signed-in screens.** `src/app/(elder)/layout.tsx` renders, inside `<Suspense
fallback={null}>`, a server component that calls identity's `getDisplayPrefs()` and hands
the result to the client component `DisplayPrefsSync`. On mount it applies the account
value to `<html>` and writes it to `localStorage` when the two differ. It acts on mount
only, never on a later prop update: a later update can only be the echo of this device's
own save, and applying an echo that is one change behind would undo the person's latest
tap. A change made on another device arrives with the next full load or sign-in.

**Changing the setting.** `DisplaySettings` gains an optional `saveAction` prop. A change
still applies at once and is copied to `localStorage`; with `saveAction` it is also sent to
the account. When the save fails the choice stays on this page and the dialog says, in a
`Notice`, "ยังบันทึกการตั้งค่าไม่ได้ กรุณาลองอีกครั้ง", with a secondary button "ลองอีกครั้ง"
that sends the current choice again. The account value wins again at the next full load. `/home` (infra's screen) passes the action.

**Signed-out screens.** `src/app/(auth)/layout.tsx` renders `DisplayPrefsReset`. On a full
load an inline script (a second fixed literal, same rules as the first) removes the stored
copy and the attributes before first paint; on a client navigation a layout effect does the
same before the next paint. So the sign-in screens are at the default even when the last
session ended without a sign-out, and nothing flashes.

**Storage blocked.** The inline script finds nothing, so a full load paints the default and
`DisplayPrefsSync` applies the account value straight after hydration: a short flash, but
the person's own value. Better than today, where a blocked browser forgets on every load.

**First screen after sign-in.** The sign-in redirect is a client navigation; the signed-in
layout's Suspense boundary streams in with the page, and `DisplayPrefsSync` applies the
value in a layout effect. The page's skeleton may paint once at the default size before
the value arrives. Accepted (decision 5).

## What each lane builds

**infra (this branch)**

- `src/shared/lib/display-settings.ts`: `syncDisplayPrefs`, `resetDisplayPrefs`,
  `clearDisplayPrefs`, `DISPLAY_PREFS_RESET_SCRIPT`; tests next to it, including "the reset
  script and the function agree".
- `src/shared/ui/DisplayPrefsSync.tsx`, `DisplayPrefsReset.tsx`; `DisplaySettings` gets
  `saveAction`.
- `src/app/(elder)/layout.tsx`, `src/app/(auth)/layout.tsx`, `src/app/(elder)/home/page.tsx`.
- A marked stub in `src/app/_display/` for the two identity exports
  (`TODO(infra): replace when #50 lands`): the query answers `null` (nothing to sync)
  and the action answers `ok` without storing. With the stub the setting behaves as today
  on the device, plus the reset on the signed-out screens.
- Docs: `docs/design-system.md`, `docs/ai/CHAT-CONTEXT.md`, `docs/security.md` rule 10,
  `docs/decisions.md`, `docs/contracts/module-apis.md` (two planned rows).

**identity (cross-module request)**

- Migration: `users.display_size SMALLINT NOT NULL DEFAULT 1` with a hand-written
  `CHECK (display_size BETWEEN 1 AND 3)`, `users.display_high_contrast BOOLEAN NOT NULL
DEFAULT false`. `docs/database.md` updated.
- `getDisplayPrefs(): Promise<DisplayPrefs | null>` — the signed-in person's own value,
  `null` when signed out. `DisplayPrefs` is the type from `@/shared/lib/display-settings`.
- `saveDisplayPrefsAction(prefs: DisplayPrefs): Promise<ActionResult<DisplayPrefs>>` — the
  six steps; writes only the caller's own row; Zod schema in `contracts.ts`.
- Erasure resets both columns to their defaults (one more line in the anonymise table).
- The privacy notice (ID-21, still a placeholder) lists the two settings among the data
  kept about a person, and "Profile fields" in identity's `AGENTS.md` names them.

## Privacy and security

- A new personal field: high contrast may hint at eyesight. Approved by the lead in this
  request (`AGENTS.md` §10). The privacy notice text is identity's and not written yet, so
  the requirement goes into the cross-module issue and `docs/decisions.md`.
- A person reads and writes only their own value. No ADMIN read exists, so no audited read.
- The copy in `localStorage` is a display preference (rule 10 already allows it); the rule's
  wording is tightened to say it is the signed-in person's copy and is removed on the
  signed-out screens.

## Calls made by the builder (not asked; veto any of them)

1. A person changing their own setting writes no `audit_logs` row: the log is for staff
   actions and reads of other people's data, and a row per tap would bury them.
2. `high contrast` is a boolean column, not an enum: there are two states.
3. `DisplayPrefsSync` and `DisplayPrefsReset` are imported by path from the layouts, like
   `DisplayPrefsScript`; they are not in the lane-facing catalogue.
4. No design doc changes to the sign-in recipes: those screens just render at the default.
5. The failure message comes with a "ลองอีกครั้ง" button: choosing the same size again does
   not fire a change, so without it "try again" would have nothing to press.

Issues: infra #49, identity #50.

## To check when identity's part lands

- Sign in as A (size 3), sign out, sign in as B on the same tab: B sees B's value, and the
  signed-in layout is not served from the router cache with A's value.
- The save action's `refresh()` does not undo a quick second tap.
