"use client";

import { useLayoutEffect, useRef } from "react";
import { useServerInsertedHTML } from "next/navigation";
import {
  browserStorage,
  DISPLAY_PREFS_RESET_SCRIPT,
  resetDisplayPrefs,
} from "@/shared/lib/display-settings";

/**
 * Signed out means the default: rendered by the layout of the screens before sign-in, it
 * removes the last person's text size and contrast from this device. One place covers every
 * way a session ends (sign-out, expiry, idle, a PIN reset), so no sign-out path has to
 * remember to do it.
 *
 * On a full load the inline script does it before the first paint (inserted the same way as
 * DisplayPrefsScript, and harmless to run twice). On a client navigation, where no script
 * runs, the layout effect does it before the next paint.
 */
export function DisplayPrefsReset() {
  const inserted = useRef(false);
  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;
    return <script dangerouslySetInnerHTML={{ __html: DISPLAY_PREFS_RESET_SCRIPT }} />;
  });

  useLayoutEffect(() => {
    resetDisplayPrefs(document.documentElement, browserStorage());
  }, []);

  return null;
}
