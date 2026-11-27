"use client";

import { useLayoutEffect, useRef } from "react";
import { browserStorage, syncDisplayPrefs, type DisplayPrefs } from "@/shared/lib/display-settings";

/**
 * Signed in: makes this device show the account's text size and contrast. Rendered by the
 * layout of the signed-in elderly screens with the value read from the account.
 *
 * It acts when it mounts (a full load, or arriving from the sign-in screens) and never on a
 * later prop update. A later update can only be the echo of this device's own save, and an
 * echo that is one change behind would undo the person's latest tap. A change made on
 * another device arrives with the next full load or sign-in.
 */
export function DisplayPrefsSync({ prefs }: { prefs: DisplayPrefs }) {
  const account = useRef(prefs);
  useLayoutEffect(() => {
    syncDisplayPrefs(account.current, document.documentElement, browserStorage());
  }, []);
  return null;
}
