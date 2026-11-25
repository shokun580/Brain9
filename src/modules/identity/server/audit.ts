import "server-only";
import { db } from "@/shared/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export type AuditEntry = {
  /** Who did it. Null for system jobs. */
  actorId: string | null;
  /** Dot-separated verb, e.g. "course.create", "user.view", "device.approve". */
  action: string;
  entityType: string;
  entityId?: string;
  /** Whose personal data was touched, if any. */
  targetUserId?: string;
  /** Small, non-sensitive context. Never credentials, tokens, or whole personal records. */
  metadata?: Prisma.InputJsonObject;
};

/**
 * Appends one row to the audit trail. Call it from every admin action that reads or
 * changes another person's data, and from security-relevant actions.
 */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  await db.auditLog.create({
    data: {
      actorId: entry.actorId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      targetUserId: entry.targetUserId,
      metadata: entry.metadata,
    },
  });
}
