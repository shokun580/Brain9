"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./Button";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  /** The consequences of confirming. */
  children: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Modal confirmation on a native `<dialog>`: the browser traps focus and handles Escape.
 * Cancel comes first and is focused explicitly after showModal() (autoFocus does nothing in
 * a closed dialog), so a stray Enter never confirms.
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = "ยกเลิก",
  tone = "primary",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // Escape: keep the state in the parent authoritative instead of closing natively.
        event.preventDefault();
        onCancel();
      }}
      className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-dialog border-[length:var(--b9-border)] border-edge bg-surface p-6 text-fg shadow-overlay backdrop:bg-black/50"
    >
      <h2 id={titleId} className="text-heading font-bold">
        {title}
      </h2>
      <div className="mt-2 text-body text-fg-2">{children}</div>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button ref={cancelRef} variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
