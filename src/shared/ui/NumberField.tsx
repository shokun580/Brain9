import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";
import { fieldWiring, FieldShell, type FieldBase } from "./Field";

export type NumberFieldProps = FieldBase &
  InputHTMLAttributes<HTMLInputElement> & { unit?: string };

/** Numeric input with an optional unit suffix inside the bordered box. */
export function NumberField({
  label,
  name,
  errors,
  hint,
  unit,
  className,
  id,
  "aria-describedby": describedBy,
  ...props
}: NumberFieldProps) {
  const unitId = `${id ?? `field-${name}`}-unit`;
  // Own hint/error id first, then the unit, then the caller's ids.
  const wiring = fieldWiring(
    name,
    id,
    hint,
    errors,
    [unit ? unitId : undefined, describedBy].filter(Boolean).join(" ") || undefined,
  );
  return (
    <FieldShell label={label} hint={hint} errors={errors} wiring={wiring}>
      {/* A label, not a div, so a click on the padding or the unit focuses the input. */}
      <label
        htmlFor={wiring.id}
        className={cn(
          "flex min-h-control w-full has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus items-center gap-3 rounded-field border-[length:var(--b9-border)] bg-surface px-4",
          wiring.hasError ? "border-danger" : "border-line-strong",
        )}
      >
        <input
          id={wiring.id}
          name={name}
          inputMode="decimal"
          aria-invalid={wiring.hasError || undefined}
          aria-describedby={wiring.describedBy}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-body text-fg placeholder:text-fg-muted focus-visible:outline-none",
            className,
          )}
          {...props}
        />
        {unit ? (
          <span id={unitId} className="text-body text-fg-muted">
            {unit}
          </span>
        ) : null}
      </label>
    </FieldShell>
  );
}
