/**
 * identity — public server API. OWNER: Chanon (@chanon-max).
 *
 * Everything other modules may use from identity is exported here. Import it as
 * `@/modules/identity`; importing any deeper path is blocked by ESLint.
 *
 * Planned additions (identity backlog): sign-up with PDPA consent, phone + PIN login,
 * logout, center-device registration, consent withdrawal, data-subject requests.
 */
export type { CurrentUser, UsageContext, UserRole } from "./contracts";
export { getCurrentUser, requireAdmin, requireUser, SESSION_COOKIE } from "./server/current-user";
export { recordAudit, type AuditEntry } from "./server/audit";
