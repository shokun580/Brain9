// Client-safe contracts for the engine module. OWNER: Supanat (@Pxrch).
import { z } from "zod";

/**
 * AttemptTaps — what the browser sends for one attempt at an item, and what is stored in
 * item_attempts.taps. `t` is milliseconds since the pattern finished displaying
 * (performance.now based). A step with two cells is one simultaneous two-finger press.
 */
export const attemptTapSchema = z.object({
  cells: z.array(z.number().int().min(0).max(8)).min(1).max(2),
  t: z.number().int().nonnegative(),
});

export const attemptTapsSchema = z.array(attemptTapSchema).min(1).max(50);

export type AttemptTap = z.infer<typeof attemptTapSchema>;
export type AttemptTaps = z.infer<typeof attemptTapsSchema>;
