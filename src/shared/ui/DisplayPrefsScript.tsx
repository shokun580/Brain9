"use client";

import { useLayoutEffect, useRef } from "react";
import { useServerInsertedHTML } from "next/navigation";
import {
  applyDisplayPrefs,
  DISPLAY_PREFS_SCRIPT,
  loadDisplayPrefs,
} from "@/shared/lib/display-settings";

/**
 * The one owner of "apply the stored text size and contrast". Mounted by the root layout, so it
 * covers every page.
 *
 * Before first paint, an inline script (inserted into the server HTML stream, not rendered as a
 * <script> element, so React's dev warning about scripts in components does not fire) sets the
 * attributes on <html>. The prerender runs this component more than once, so the script can
 * appear twice in the static HTML; it only reads storage and sets attributes, so running twice
 * is harmless. It runs on the initial document only, which is enough: the attributes persist
 * across client navigations.
 */
export function DisplayPrefsScript() {
  const inserted = useRef(false);
  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;
    return <script dangerouslySetInnerHTML={{ __html: DISPLAY_PREFS_SCRIPT }} />;
  });

  // Strict Mode's dev remount resets <html> to the attributes React manages, clearing what the
  // inline script set. Re-apply the stored prefs before paint (a no-op in production). When
  // storage is unreadable there is nothing stored to restore, so leave <html> alone.
  useLayoutEffect(() => {
    try {
      applyDisplayPrefs(loadDisplayPrefs(window.localStorage), document.documentElement);
    } catch {
      // Storage blocked: nothing to restore.
    }
  }, []);

  return null;
}
