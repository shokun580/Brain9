import type { ReactNode } from "react";

export type SaveBarProps = {
  dirty: boolean;
  /** The buttons. */
  children: ReactNode;
};

/** Sticky bar at the foot of an editor: the unsaved-changes note on the left, buttons at the end. */
export function SaveBar({ dirty, children }: SaveBarProps) {
  return (
    <div className="sticky bottom-0 flex flex-wrap items-center gap-x-4 gap-y-3 border-t-[length:var(--b9-border)] border-line bg-surface px-4 py-3">
      {/* Stays mounted so screen readers announce the change when `dirty` flips. */}
      <p
        role="status"
        className="m-0 flex min-w-0 flex-1 basis-48 items-center gap-2 text-body text-fg"
      >
        {dirty ? (
          <>
            <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-attention" />
            มีการแก้ไขที่ยังไม่บันทึก
          </>
        ) : null}
      </p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}
