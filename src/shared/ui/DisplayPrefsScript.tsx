"use client";

import { useRef } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { DISPLAY_PREFS_SCRIPT } from "@/shared/lib/display-settings";

/**
 * Applies the stored text size and contrast to <html> before first paint. The script is
 * inserted into the server HTML stream (not rendered as a <script> element), so React's dev
 * warning about scripts in components does not fire. It runs on the initial document only,
 * which is enough: the attributes it sets on <html> persist across client navigations.
 */
export function DisplayPrefsScript() {
  const inserted = useRef(false);
  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;
    return <script dangerouslySetInnerHTML={{ __html: DISPLAY_PREFS_SCRIPT }} />;
  });
  return null;
}
