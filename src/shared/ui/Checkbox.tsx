import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";
import { fieldWiring, FieldMessages } from "./Field";

export type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  /** Short help text; hidden while an error is shown. */
  hint?: string;
  /** Validation messages for this field (from ActionResult.fieldErrors). */
  errors?: string[];
};

/** Checkbox whose whole row (box + label) is the touch target. */
export function Checkbox({
  label,
  name,
  id,
  hint,
  errors,
  className,
  "aria-describedby": describedBy,
  ...props
}: CheckboxProps) {
  const wiring = fieldWiring(name, id, hint, errors, describedBy);
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={wiring.id}
        className="flex min-h-control cursor-pointer items-center gap-3 text-body text-fg"
      >
        <input
          id={wiring.id}
          name={name}
          type="checkbox"
          aria-invalid={wiring.hasError || undefined}
          aria-describedby={wiring.describedBy}
          className={cn("size-7 shrink-0 accent-primary", className)}
          {...props}
        />
        <span>{label}</span>
      </label>
      <FieldMessages hint={hint} errors={errors} wiring={wiring} />
    </div>
  );
}
