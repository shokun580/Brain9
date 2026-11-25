// Client-safe types for the identity module (no server imports here).
import type { UsageContext, UserRole } from "@/generated/prisma/enums";

export type { UsageContext, UserRole };

/**
 * The signed-in person as every other module sees them.
 * Deliberately narrow: no phone, no credential data.
 */
export type CurrentUser = {
  id: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  /** HOME = personal device, CENTER = registered community-center device. */
  context: UsageContext;
  /** Set when context is CENTER. */
  centerId: string | null;
  deviceId: string | null;
};
