import type { SelectHTMLAttributes } from "react";
import { controlClass, fieldWiring, FieldShell, type FieldBase } from "./Field";

export type SelectProps = FieldBase &
  SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] };

/** Labelled native select (native keeps the picker accessible on phones and tablets). */
export function Select({
  label,
  name,
  errors,
  hint,
  options,
  className,
  id,
  ...props
}: SelectProps) {
  const wiring = fieldWiring(name, id, hint, errors);
  return (
    <FieldShell label={label} hint={hint} errors={errors} wiring={wiring}>
      <select
        id={wiring.id}
        name={name}
        aria-invalid={wiring.hasError || undefined}
        aria-describedby={wiring.describedBy}
        className={controlClass(wiring.hasError, `min-h-control ${className ?? ""}`)}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
