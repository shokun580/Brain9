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
- `requireUser()`, `requireAdmin()` — redirect when not allowed.
- `recordAudit(entry)` — append to `audit_logs`.
- `CurrentUser` = `{ id, role, firstName, lastName, context, centerId, deviceId }`.

To add: sign-up, login, logout, consent, device registration (as Server Actions returning
`ActionResult`), and `getCenterDeviceContext()` for the booking and engine lanes.

## Domain rules already decided (team lead, 2026-11-25)

**Login**

- Identifier is the phone number (digits only, unique). Elderly users use a 4–6 digit PIN;
  admins use a long password. Both are stored as bcrypt hashes in `credential_hash`.
- Count failures in `failed_login_count`; lock with `locked_until`. Messages must not
  reveal whether a phone number exists.
- Session = random token in an HttpOnly, Secure, SameSite=Lax cookie (`brain9_session`);
  the database stores only its SHA-256 (`auth_sessions.token_hash`).

**Roles** — exactly two: `USER` (elderly) and `ADMIN` (caregiver / center staff). There is
no per-person caregiver link. Every ADMIN sees every center. A relative is stored only as
an emergency contact.

**Profile fields** — first/last name, phone, birth date, gender, emergency contact(s),
home center. Nothing else without the lead's approval (PDPA data minimisation).

**PDPA**

- Sign-up shows the privacy notice and terms in large, plain Thai. Consent checkboxes are
  never pre-ticked. Each acceptance inserts a `user_consents` row with the exact
  `policy_documents` version, time, context and device.
- Withdrawing consent inserts a `WITHDRAWN` row (the ledger is append-only) and must be as
  easy as granting it. Withdrawing `COGNITIVE_DATA` stops analytics for that user;
  withdrawing `PERSONAL_DATA` or `TERMS_OF_USE` ends the sessions and starts an erasure request.
- Users can view their stored data, correct it, and request erasure
  (`data_subject_requests`, due within 30 days). Erasure = anonymize the `users` row
  (`status = ANONYMIZED`, `phone = NULL`, names replaced) and delete emergency contacts.
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

## Suggested order

1. Real `getCurrentUser()` + login/logout (unblocks every lane on staging)
2. Sign-up with consent
3. Admin user list / suspend / role
4. Centers + center-device registration and kiosk mode
5. Profile, consent withdrawal, data-subject requests
