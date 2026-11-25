"use client";

import { Delete } from "lucide-react";

export type PinPadProps = {
  length: 4 | 6;
  /** How many digits are entered so far. The pad never sees or keeps the digits themselves. */
  filled: number;
  onDigit: (digit: string) => void;
  onDelete: () => void;
  /** Locks every key, e.g. while a PIN is being checked. */
  disabled?: boolean;
};

const rows = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
] as const;

const keyClass =
  "flex min-h-control items-center justify-center gap-2 rounded-control border-[length:var(--b9-border)] border-line-strong bg-surface font-bold text-fg active:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60";

/** Number pad for the PIN. Dots show progress only; digits are reported, never stored or shown. */
export function PinPad({ length, filled, onDigit, onDelete, disabled }: PinPadProps) {
  const count = Number.isFinite(filled) ? Math.min(Math.max(Math.floor(filled), 0), length) : 0;
  const progress = `ใส่แล้ว ${count} จาก ${length} หลัก`;
  return (
    <div className="mx-auto w-full max-w-xs">
      {/* Announces each tap; says how many digits, never which. */}
      <p aria-live="polite" className="sr-only">
        {progress}
      </p>
      <div role="img" aria-label={progress} className="mb-5 flex justify-center gap-3">
        {Array.from({ length }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={
              i < count
                ? "size-5 rounded-full border-[length:var(--b9-border)] border-primary bg-primary"
                : "size-5 rounded-full border-[length:var(--b9-border)] border-line-strong bg-surface"
            }
          />
        ))}
      </div>
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
    </div>
  );
}
