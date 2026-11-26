"use client";

import { useId } from "react";
import { cn } from "@/shared/lib/cn";
import { fieldWiring, FieldMessages } from "./Field";
import { Keypad } from "./keypad";
import { formatPhoneDigits, nextPhoneValue, PHONE_LENGTH } from "./phone-format";

export type PhonePadProps = {
  /** Visible label, e.g. "เบอร์โทรศัพท์". */
  label: string;
  /** Digits only, 0 to 10 characters. Controlled. */
  value: string;
  onChange: (value: string) => void;
  /** Adds a hidden form field with the digits, for a form that posts to a Server Action. */
  name?: string;
  hint?: string;
  /** Shown under the number, with the same wording rules as a field error. */
  error?: string;
  disabled?: boolean;
};

/** Phone-number entry through the app's own keys. The number is shown in a read-only display,
 *  never an `<input>`, so the phone's keyboard never opens. The component does not validate. */
export function PhonePad({ label, value, onChange, name, hint, error, disabled }: PhonePadProps) {
  const id = useId();
  const digits = value.replace(/\D/g, "").slice(0, PHONE_LENGTH);
  const shown = formatPhoneDigits(digits);
  const progress = `ใส่แล้ว ${digits.length} จาก ${PHONE_LENGTH} หลัก`;
  const wiring = fieldWiring(name ?? "phone", id, hint, error ? [error] : undefined);
  return (
    <div className="mx-auto flex w-full max-w-xs flex-col gap-2">
      <p id={`${id}-label`} className="text-body font-bold text-fg">
        {label}
      </p>
      {/* Announces each tap; a phone number is not secret, so the display shows the digits. */}
      <p aria-live="polite" className="sr-only">
        {progress}
      </p>
      <div
        role="img"
        aria-label={`${label} ${digits || "ยังไม่ได้ใส่"}`}
        aria-describedby={wiring.describedBy}
        className={cn(
          "flex min-h-control w-full items-center justify-center rounded-field border-[length:var(--b9-border)] bg-surface px-4 text-title font-bold",
          wiring.hasError ? "border-danger" : "border-line-strong",
          disabled && "opacity-60",
          digits ? "text-fg" : "text-fg-muted",
        )}
      >
        <span aria-hidden="true">{shown || "0xx-xxx-xxxx"}</span>
      </div>
      <FieldMessages hint={hint} errors={error ? [error] : undefined} wiring={wiring} />
      <div className="mt-3">
        <Keypad
          disabled={disabled}
          onDigit={(digit) => onChange(nextPhoneValue(digits, digit))}
          onDelete={() => onChange(digits.slice(0, -1))}
        />
      </div>
      {name ? <input type="hidden" name={name} value={digits} /> : null}
    </div>
  );
}
