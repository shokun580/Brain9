"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ActionResult } from "@/shared/lib/action-result";
import {
  applyDisplayPrefs,
  browserStorage,
  readAppliedDisplayPrefs,
  saveDisplayPrefs,
  type DisplayPrefs,
} from "@/shared/lib/display-settings";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { ChoiceList } from "./ChoiceList";
import { Notice } from "./Notice";

export type DisplaySettingsProps = {
  triggerLabel?: string;
  /**
   * Saves the choice to the signed-in person's account, so it follows them to every device.
   * Without it the choice lives on this device only (the design page, a signed-out demo).
   */
  saveAction?: (prefs: DisplayPrefs) => Promise<ActionResult<DisplayPrefs>>;
};

const sizeOptions = [
  { value: "1", title: "ปกติ" },
  { value: "2", title: "ใหญ่" },
  { value: "3", title: "ใหญ่มาก" },
];

function toSize(value: string): DisplayPrefs["size"] {
  return value === "2" ? 2 : value === "3" ? 3 : 1;
}

/**
 * Text size and high contrast. A change applies at once, is copied to localStorage (so a
 * reload paints it without a flash) and, with `saveAction`, is saved to the person's account.
 * When storage is blocked or the save fails, the choice still holds for the current page.
 */
export function DisplaySettings({
  triggerLabel = "ก ขนาดตัวอักษร",
  saveAction,
}: DisplaySettingsProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<DisplayPrefs>({ size: 1, contrast: "normal" });
  // Remounts the (uncontrolled) size list each time the dialog opens, so it shows what is applied.
  const [session, setSession] = useState(0);
  const [saveFailed, setSaveFailed] = useState(false);
  // Only the answer to the latest save decides what the dialog says.
  const latestSave = useRef(0);

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
    setSaveFailed(false);
    setOpen(true);
  }

  async function saveToAccount(next: DisplayPrefs) {
    if (!saveAction) return;
    const attempt = ++latestSave.current;
    setSaveFailed(false);
    let saved = false;
    try {
      saved = (await saveAction(next)).ok;
    } catch {
      // Offline, or the request never reached the server.
    }
    if (attempt === latestSave.current) setSaveFailed(!saved);
  }

  function change(next: DisplayPrefs) {
    setPrefs(next);
    applyDisplayPrefs(next, document.documentElement);
    // Storage can be blocked (private mode, policy): the setting still applies to this page.
    saveDisplayPrefs(browserStorage(), next);
    void saveToAccount(next);
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
          {saveFailed ? (
            <div className="flex flex-col items-start gap-3">
              <Notice tone="danger">ยังบันทึกการตั้งค่าไม่ได้ กรุณาลองอีกครั้ง</Notice>
              <Button variant="secondary" onClick={() => void saveToAccount(prefs)}>
                ลองอีกครั้ง
              </Button>
            </div>
          ) : null}
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
