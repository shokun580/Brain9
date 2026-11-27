/**
 * Text size (1 = default) and contrast chosen by an elderly user. The choice belongs to the
 * person: the account holds it, and this device keeps a copy in localStorage only so the
 * inline script can set <html> before the first paint. Signed out means the default.
 */
export type DisplayPrefs = { size: 1 | 2 | 3; contrast: "normal" | "high" };

export const DISPLAY_PREFS_KEY = "brain9.display";

export const DEFAULT_DISPLAY_PREFS: DisplayPrefs = { size: 1, contrast: "normal" };

/** Fields are checked one by one so a single bad value never discards the other. */
export function toDisplayPrefs(value: unknown): DisplayPrefs {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { ...DEFAULT_DISPLAY_PREFS };
  }
  const { size, contrast } = value as Record<string, unknown>;
  return {
    size: size === 2 || size === 3 ? size : 1,
    contrast: contrast === "high" ? "high" : "normal",
  };
}

export function parseDisplayPrefs(raw: string | null): DisplayPrefs {
  if (!raw) return { ...DEFAULT_DISPLAY_PREFS };
  try {
    return toDisplayPrefs(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_DISPLAY_PREFS };
  }
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

/** Removes the stored copy. Returns false (never throws) when storage is missing or blocked. */
export function clearDisplayPrefs(storage: Pick<Storage, "removeItem"> | undefined): boolean {
  if (!storage) return false;
  try {
    storage.removeItem(DISPLAY_PREFS_KEY);
    return true;
  } catch {
    return false;
  }
}

/** `window.localStorage` itself can throw (SecurityError in some private modes). */
export function browserStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

/**
 * Signed in: the account's value wins over whatever this device holds. It is applied to
 * `<html>` and copied to storage, so the next full load paints it without a flash. When
 * storage is blocked the page still gets the value.
 */
export function syncDisplayPrefs(
  account: DisplayPrefs,
  root: { dataset: DOMStringMap },
  storage: Pick<Storage, "setItem"> | undefined,
): void {
  applyDisplayPrefs(account, root);
  saveDisplayPrefs(storage, account);
}

/**
 * Signed out: the device shows the default and keeps nobody's copy, so the next person on a
 * shared tablet never inherits the last person's settings.
 */
export function resetDisplayPrefs(
  root: { dataset: DOMStringMap },
  storage: Pick<Storage, "removeItem"> | undefined,
): void {
  applyDisplayPrefs(DEFAULT_DISPLAY_PREFS, root);
  clearDisplayPrefs(storage);
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
 *
 * The script is one fixed literal: nothing is interpolated into it, so no value can ever
 * change the code that runs. The storage key is therefore written out here a second time;
 * the test fails if it stops matching DISPLAY_PREFS_KEY.
 */
export const DISPLAY_PREFS_SCRIPT = `(function(){try{var r=localStorage.getItem("brain9.display");if(!r)return;var p=JSON.parse(r);if(!p||typeof p!=="object"||Array.isArray(p))return;var d=document.documentElement.dataset;if(p.size===2||p.size===3)d.size=String(p.size);if(p.contrast==="high")d.contrast="high"}catch(e){}})()`;

/**
 * The signed-out twin of DISPLAY_PREFS_SCRIPT, inserted by the layout of the screens before
 * sign-in: it does what resetDisplayPrefs does, before the first paint. Same rules: plain
 * ES5, one fixed literal, the key written out, and display-settings.test.ts keeps it in
 * step with resetDisplayPrefs. The order of the two scripts does not matter.
 */
export const DISPLAY_PREFS_RESET_SCRIPT = `(function(){try{localStorage.removeItem("brain9.display")}catch(e){}try{var d=document.documentElement.dataset;delete d.size;delete d.contrast}catch(e){}})()`;
