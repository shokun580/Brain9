import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & { label: string; name: string };

/** Checkbox whose whole row (box + label) is the touch target. */
export function Checkbox({ label, name, id, className, ...props }: CheckboxProps) {
  const inputId = id ?? `field-${name}`;
  return (
    <label
      htmlFor={inputId}
      className="flex min-h-control cursor-pointer items-center gap-3 text-body text-fg"
    >
      <input
        id={inputId}
        name={name}
        type="checkbox"
        className={cn("size-7 shrink-0 accent-primary", className)}
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
