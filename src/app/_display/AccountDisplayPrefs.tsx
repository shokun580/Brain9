import { DisplayPrefsSync } from "@/shared/ui/DisplayPrefsSync";
import { getDisplayPrefs } from "./account-display-prefs";

/**
 * Reads the signed-in person's text size and contrast and hands them to the browser.
 * It reads the session, so the layout renders it inside <Suspense>. OWNER: infra.
 */
export async function AccountDisplayPrefs() {
  const prefs = await getDisplayPrefs();
  return prefs ? <DisplayPrefsSync prefs={prefs} /> : null;
}
