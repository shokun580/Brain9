import type { InputHTMLAttributes } from "react";
import { controlClass, fieldWiring, FieldShell, type FieldBase } from "./Field";

export type TextFieldProps = FieldBase & InputHTMLAttributes<HTMLInputElement>;

/** Labelled single-line input. */
export function TextField({
  label,
  name,
  errors,
  hint,
  className,
  id,
  "aria-describedby": describedBy,
  ...props
}: TextFieldProps) {
  const wiring = fieldWiring(name, id, hint, errors, describedBy);
  return (
    <FieldShell label={label} hint={hint} errors={errors} wiring={wiring}>
      <input
        id={wiring.id}
        name={name}
        aria-invalid={wiring.hasError || undefined}
        aria-describedby={wiring.describedBy}
        className={controlClass(wiring.hasError, `min-h-control ${className ?? ""}`)}
        {...props}
      />
    </FieldShell>
  );
}
