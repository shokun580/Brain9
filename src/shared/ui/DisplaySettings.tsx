"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import {
  applyDisplayPrefs,
  DISPLAY_PREFS_KEY,
  loadDisplayPrefs,
  parseDisplayPrefs,
  readAppliedDisplayPrefs,
  saveDisplayPrefs,
  type DisplayPrefs,
} from "@/shared/lib/display-settings";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { ChoiceList } from "./ChoiceList";

export type DisplaySettingsProps = {
  triggerLabel?: string;
};

const sizeOptions = [
  { value: "1", title: "ปกติ" },
  { value: "2", title: "ใหญ่" },
  { value: "3", title: "ใหญ่มาก" },
];

function toSize(value: string): DisplayPrefs["size"] {
  return value === "2" ? 2 : value === "3" ? 3 : 1;
}

/** `window.localStorage` itself can throw (SecurityError in some private modes). */
function getStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

/**
 * Text size and high contrast. A change applies at once and is remembered in localStorage;
 * when storage is blocked the choice still holds for the current page.
 */
export function DisplaySettings({ triggerLabel = "ก ขนาดตัวอักษร" }: DisplaySettingsProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<DisplayPrefs>({ size: 1, contrast: "normal" });
  // Remounts the (uncontrolled) size list each time the dialog opens, so it shows what is applied.
  const [session, setSession] = useState(0);

  // Strict Mode's dev remount resets <html> to the attributes React manages, clearing what the
  // inline script set. Re-apply the stored prefs before paint (no-op in production).
  // When storage is unreadable there is nothing stored to restore, so leave <html> alone.
  useLayoutEffect(() => {
    const storage = getStorage();
    if (storage) applyDisplayPrefs(loadDisplayPrefs(storage), document.documentElement);
  }, []);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      closeRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function openDialog() {
    // Seed from storage so a stored field is never lost; the applied state covers blocked storage.
    let seed = readAppliedDisplayPrefs(document.documentElement);
    try {
      const raw = getStorage()?.getItem(DISPLAY_PREFS_KEY);
      if (raw != null) seed = parseDisplayPrefs(raw);
    } catch {
      // Unreadable storage: keep what is applied on <html>.
    }
    setPrefs(seed);
    setSession((n) => n + 1);
    setOpen(true);
  }

  function change(next: DisplayPrefs) {
    setPrefs(next);
    applyDisplayPrefs(next, document.documentElement);
    // Storage can be blocked (private mode, policy): the setting still applies to this page.
    saveDisplayPrefs(getStorage(), next);
  }

  const high = prefs.contrast === "high";

  return (
    <>
      <Button variant="quiet" size="sm" className="rounded-full" onClick={openDialog}>
        {triggerLabel}
      </Button>
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        onCancel={(event) => {
          event.preventDefault();
          setOpen(false);
        }}
        className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-dialog border-[length:var(--b9-border)] border-edge bg-surface p-6 text-fg shadow-overlay backdrop:bg-black/50"
      >
        <h2 id={titleId} className="text-heading font-bold">
          ตั้งค่าการแสดงผล
        </h2>
        <div className="mt-4 flex flex-col gap-6">
          <ChoiceList
            key={session}
            name="display-size"
            legend="ขนาดตัวอักษร"
            defaultValue={String(prefs.size)}
            options={sizeOptions}
            onValueChange={(value) => change({ ...prefs, size: toSize(value) })}
          />
          <Checkbox
            name="display-contrast"
            label="สีตัดกันสูง"
            role="switch"
            checked={high}
            hint={high ? "เปิดอยู่" : "ปิดอยู่"}
            onChange={(event) =>
              change({ ...prefs, contrast: event.target.checked ? "high" : "normal" })
            }
          />
        </div>
        <div className="mt-6 flex justify-end">
          <Button ref={closeRef} onClick={() => setOpen(false)}>
            เสร็จ
          </Button>
        </div>
      </dialog>
    </>
  );
}
