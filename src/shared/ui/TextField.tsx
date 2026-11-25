import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  /** Validation messages for this field (from ActionResult.fieldErrors). */
  errors?: string[];
  hint?: string;
};

/** Labelled input with large touch target and an error message that is not colour-only. */
export function TextField({ label, name, errors, hint, className, id, ...props }: TextFieldProps) {
  const inputId = id ?? `field-${name}`;
  const hasError = Boolean(errors?.length);
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="font-bold">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={cn(
          "min-h-16 rounded-card border-2 bg-surface px-4 text-lg",
          "focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-focus",
          hasError ? "border-danger" : "border-border-strong",
          className,
        )}
        {...props}
      />
      {hint && !hasError ? (
        <p id={`${inputId}-hint`} className="text-text-2">
          {hint}
        </p>
      ) : null}
      {hasError ? (
        <p id={`${inputId}-error`} role="alert" className="font-bold text-danger">
          ✕ {errors!.join(" ")}
        </p>
      ) : null}
    </div>
  );
}
