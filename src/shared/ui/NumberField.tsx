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
  ...props
}: NumberFieldProps) {
  const wiring = fieldWiring(name, id, hint, errors);
  return (
    <FieldShell label={label} hint={hint} errors={errors} wiring={wiring}>
      <div
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
        {unit ? <span className="text-body text-fg-muted">{unit}</span> : null}
      </div>
    </FieldShell>
  );
}
