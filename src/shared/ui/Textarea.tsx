import type { TextareaHTMLAttributes } from "react";
import { controlClass, fieldWiring, FieldShell, type FieldBase } from "./Field";

export type TextareaProps = FieldBase & TextareaHTMLAttributes<HTMLTextAreaElement>;

/** Labelled multi-line input. */
export function Textarea({ label, name, errors, hint, className, id, ...props }: TextareaProps) {
  const wiring = fieldWiring(name, id, hint, errors);
  return (
    <FieldShell label={label} hint={hint} errors={errors} wiring={wiring}>
      <textarea
        id={wiring.id}
        name={name}
        rows={4}
        aria-invalid={wiring.hasError || undefined}
        aria-describedby={wiring.describedBy}
        className={controlClass(wiring.hasError, `min-h-control py-3 ${className ?? ""}`)}
        {...props}
      />
    </FieldShell>
  );
}
