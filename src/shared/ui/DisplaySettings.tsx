"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  applyDisplayPrefs,
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
    // What is applied on <html> is the truth: DisplayPrefsScript applied what is stored, and a
    // change made while storage is blocked still shows here.
    setPrefs(readAppliedDisplayPrefs(document.documentElement));
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
        className="m-auto max-h-[calc(100dvh-2rem)] w-[min(32rem,calc(100%-2rem))] overflow-y-auto rounded-dialog border-[length:var(--b9-border)] border-edge bg-surface p-6 text-fg shadow-overlay backdrop:bg-black/50"
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
