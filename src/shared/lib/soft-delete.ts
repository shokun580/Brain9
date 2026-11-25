/**
 * Soft delete helpers. Brain9 never physically deletes a row (AGENTS.md §5): a row is
 * removed by setting `deletedAt`, and every read leaves such rows out unless it has a
 * stated reason to include them (an admin "recently removed" list, an audit view).
 *
 *   db.course.findMany({ where: { ...notDeleted, status: "PUBLISHED" } });
 *   db.course.update({ where: { id }, data: softDelete() });
 *
 * `db.<model>.delete()` and `.deleteMany()` are rejected by ESLint. The append-only
 * ledgers (`user_consents`, `audit_logs`, `item_results`, `item_attempts`) have no
 * `deletedAt`; these helpers do not type-check against them, which is intended.
 */

/** Prisma `where` fragment: only rows that have not been soft-deleted. */
export const notDeleted = { deletedAt: null } as const;

/**
 * Prisma `data` fragment that soft-deletes a row. Pass one `now` to several writes in a
 * transaction so related rows carry the same timestamp.
 */
export function softDelete(now: Date = new Date()): { deletedAt: Date } {
  return { deletedAt: now };
}
