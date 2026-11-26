"use client";

import { useState, type ReactNode } from "react";
import {
  AdminSection,
  Button,
  ConfirmDialog,
  PinPad,
  SaveBar,
  Select,
  TextField,
  Toast,
} from "@/shared/ui";

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
      <Button variant={tone} onClick={() => setOpen(true)}>
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

/** The edit recipe, live: `dirty` turns on with the first change and off after a save. Saving
 *  here only resets the bar; the real form posts to a Server Action. */
export function EditFormDemo() {
  const [dirty, setDirty] = useState(false);
  return (
    <form
      onChange={() => setDirty(true)}
      onSubmit={(event) => {
        event.preventDefault();
        setDirty(false);
      }}
    >
      <AdminSection title="ข้อมูลคอร์ส">
        <div className="flex max-w-[35rem] flex-col gap-5">
          <TextField label="ชื่อคอร์ส" name="r-title" defaultValue="คอร์สตัวอย่าง 01" />
          <Select
            label="ระดับความยาก"
            name="r-level"
            options={[
              { value: "1", label: "ระดับ 1" },
              { value: "2", label: "ระดับ 2" },
            ]}
          />
        </div>
      </AdminSection>
      <div className="mt-6 [&>div]:static">
        <SaveBar dirty={dirty}>
          <Button variant="secondary" href="#recipes">
            ยกเลิก
          </Button>
          <Button type="submit">บันทึก</Button>
        </SaveBar>
      </div>
    </form>
  );
}
