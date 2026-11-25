"use client";

import { useState, type ReactNode } from "react";
import { Button, ConfirmDialog, PinPad, Toast } from "@/shared/ui";

/** Opens a ConfirmDialog from a button. The dialog's functions live here because a Server
 *  Component cannot pass functions to a client component. */
export function ConfirmDialogDemo({
  triggerLabel,
  title,
  confirmLabel,
  tone,
  children,
}: {
  triggerLabel: string;
  title: string;
  confirmLabel: string;
  tone: "primary" | "danger";
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  return (
    <div className="flex flex-col items-start gap-3">
      <Button variant={tone === "danger" ? "secondary" : "primary"} onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      {answer ? (
        <p role="status" className="text-small text-fg-muted">
          {answer}
        </p>
      ) : null}
      <ConfirmDialog
        open={open}
        title={title}
        confirmLabel={confirmLabel}
        tone={tone}
        onCancel={() => {
          setOpen(false);
          setAnswer("ยกเลิกแล้ว ไม่มีอะไรเปลี่ยนแปลง");
        }}
        onConfirm={() => {
          setOpen(false);
          setAnswer("ยืนยันแล้ว (ตัวอย่างเท่านั้น ไม่มีข้อมูลถูกเปลี่ยน)");
        }}
      >
        {children}
      </ConfirmDialog>
    </div>
  );
}

/** Shows a Toast in flow (the real one is placed by the screen that uses it). */
export function ToastDemo() {
  const [toast, setToast] = useState<{ message: string; tone: "success" | "danger" } | null>(null);
  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          onClick={() => setToast({ message: "บันทึกแล้ว", tone: "success" })}
        >
          แสดงข้อความสำเร็จ
        </Button>
        <Button
          variant="secondary"
          onClick={() => setToast({ message: "บันทึกไม่สำเร็จ ลองอีกครั้งนะ", tone: "danger" })}
        >
          แสดงข้อความไม่สำเร็จ
        </Button>
      </div>
      {toast ? <Toast message={toast.message} tone={toast.tone} /> : null}
    </div>
  );
}

/** A working PIN pad that counts digits and never keeps them. */
export function PinPadDemo() {
  const [filled, setFilled] = useState(0);
  return (
    <PinPad
      length={4}
      filled={filled}
      onDigit={() => setFilled((count) => Math.min(count + 1, 4))}
      onDelete={() => setFilled((count) => Math.max(count - 1, 0))}
    />
  );
}
