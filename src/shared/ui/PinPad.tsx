"use client";

import { Keypad } from "./keypad";

export type PinPadProps = {
  length: 4 | 6;
  /** How many digits are entered so far. The pad never sees or keeps the digits themselves. */
  filled: number;
  onDigit: (digit: string) => void;
  onDelete: () => void;
  /** Locks every key, e.g. while a PIN is being checked. */
  disabled?: boolean;
};

/** Number pad for the PIN. Dots show progress only; digits are reported, never stored or shown.
 *  It holds no `<input>`, so the phone's keyboard never opens. */
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
      <Keypad onDigit={onDigit} onDelete={onDelete} disabled={disabled} />
    </div>
  );
}
