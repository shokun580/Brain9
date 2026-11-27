import { ok, type ActionResult } from "@/shared/lib/action-result";
import { toDisplayPrefs, type DisplayPrefs } from "@/shared/lib/display-settings";

// OWNER: infra. A stand-in for two exports the identity lane will provide: the text size and
// contrast stored on the signed-in person (`users.display_size`, `users.display_high_contrast`).
//
// TODO(infra): replace when https://github.com/shokun580/Brain9/issues/50 lands. Delete this
// file and import `getDisplayPrefs` and `saveDisplayPrefsAction` from "@/modules/identity" in
// AccountDisplayPrefs.tsx and in src/app/(elder)/home/page.tsx.

/**
 * The signed-in person's own settings; null when nobody is signed in.
 * Stand-in: always null, so nothing is synced and the device keeps its own value.
 */
export async function getDisplayPrefs(): Promise<DisplayPrefs | null> {
  return null;
}

/**
 * Saves the signed-in person's own settings.
 * Stand-in: stores nothing and answers ok, so the choice lives on the device as before.
 */
export async function saveDisplayPrefsAction(
  prefs: DisplayPrefs,
): Promise<ActionResult<DisplayPrefs>> {
  "use server";
  // A Server Action is a public endpoint: never echo what was sent without checking it.
  return ok(toDisplayPrefs(prefs));
}
