"use client";

import { Delete } from "lucide-react";

/** The twelve keys shared by `PinPad` and `PhonePad`. Private to the design system: not
 *  exported from the index. Buttons only, so no keyboard ever opens. */
export type KeypadProps = {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  disabled?: boolean;
};

const rows = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
] as const;

const keyClass =
  "flex min-h-control items-center justify-center gap-2 rounded-control border-[length:var(--b9-border)] border-line-strong bg-surface font-bold text-fg active:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60";

export function Keypad({ onDigit, onDelete, disabled }: KeypadProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {rows.flat().map((digit) => (
        <button
          key={digit}
          type="button"
          disabled={disabled}
          className={`${keyClass} text-title`}
          onClick={() => onDigit(digit)}
        >
          {digit}
        </button>
      ))}
      <span aria-hidden="true" />
      <button
        type="button"
        disabled={disabled}
        className={`${keyClass} text-title`}
        onClick={() => onDigit("0")}
      >
        0
      </button>
      <button
        type="button"
        disabled={disabled}
        className={`${keyClass} text-body`}
        onClick={onDelete}
      >
        <Delete aria-hidden="true" strokeWidth={1.9} className="size-icon-sm shrink-0" />
        ลบ
      </button>
    </div>
  );
}
