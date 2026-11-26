/** Text size (1 = default) and contrast chosen by an elderly user, remembered on the device. */
export type DisplayPrefs = { size: 1 | 2 | 3; contrast: "normal" | "high" };

export const DISPLAY_PREFS_KEY = "brain9.display";

export const DEFAULT_DISPLAY_PREFS: DisplayPrefs = { size: 1, contrast: "normal" };

/** Fields are checked one by one so a single bad value never discards the other. */
export function parseDisplayPrefs(raw: string | null): DisplayPrefs {
  if (!raw) return { ...DEFAULT_DISPLAY_PREFS };
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ...DEFAULT_DISPLAY_PREFS };
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { ...DEFAULT_DISPLAY_PREFS };
  }
  const { size, contrast } = value as Record<string, unknown>;
  return {
    size: size === 2 || size === 3 ? size : 1,
    contrast: contrast === "high" ? "high" : "normal",
  };
}

export function serializeDisplayPrefs(prefs: DisplayPrefs): string {
  return JSON.stringify({ size: prefs.size, contrast: prefs.contrast });
}

/** Reflects the prefs on `<html>`. The defaults need no attribute, so they remove it. */
export function applyDisplayPrefs(prefs: DisplayPrefs, root: { dataset: DOMStringMap }): void {
  if (prefs.size === 1) delete root.dataset.size;
  else root.dataset.size = String(prefs.size);
  if (prefs.contrast === "high") root.dataset.contrast = "high";
  else delete root.dataset.contrast;
}

/** Reads the saved prefs; the defaults when storage is missing or throws. */
export function loadDisplayPrefs(storage: Pick<Storage, "getItem"> | undefined): DisplayPrefs {
  try {
    return parseDisplayPrefs(storage ? storage.getItem(DISPLAY_PREFS_KEY) : null);
  } catch {
    return { ...DEFAULT_DISPLAY_PREFS };
  }
}

/** Saves the prefs. Returns false (never throws) when storage is missing or blocked. */
export function saveDisplayPrefs(
  storage: Pick<Storage, "setItem"> | undefined,
  prefs: DisplayPrefs,
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(DISPLAY_PREFS_KEY, serializeDisplayPrefs(prefs));
    return true;
  } catch {
    return false;
  }
}

/** The prefs currently applied to `<html>`, which stay true even when storage is unavailable. */
export function readAppliedDisplayPrefs(root: { dataset: DOMStringMap }): DisplayPrefs {
  return parseDisplayPrefs(
    JSON.stringify({ size: Number(root.dataset.size), contrast: root.dataset.contrast }),
  );
}

/**
 * Runs in `<head>` before the first paint (see the Next.js guide "Preventing flash before
 * hydration"). Plain ES5 on purpose: it is a string, so it cannot import parseDisplayPrefs;
 * display-settings.test.ts runs it against the same inputs to keep the two in step.
 */
export const DISPLAY_PREFS_SCRIPT = `(function(){try{var r=localStorage.getItem(${JSON.stringify(
  DISPLAY_PREFS_KEY,
)});if(!r)return;var p=JSON.parse(r);if(!p||typeof p!=="object"||Array.isArray(p))return;var d=document.documentElement.dataset;if(p.size===2||p.size===3)d.size=String(p.size);if(p.contrast==="high")d.contrast="high"}catch(e){}})()`;
