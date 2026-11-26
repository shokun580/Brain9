import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/** Props every labelled form control shares. */
export type FieldBase = {
  label: string;
  name: string;
  /** Short help text; hidden while an error is shown. */
  hint?: string;
  /** Validation messages for this field (from ActionResult.fieldErrors). */
  errors?: string[];
};

/** Wiring a control needs to be announced with its hint or error. */
export type FieldWiring = {
  id: string;
  hasError: boolean;
  describedBy: string | undefined;
};

export function fieldWiring(
  name: string,
  id: string | undefined,
  hint: string | undefined,
  errors: string[] | undefined,
  /** A caller-supplied aria-describedby, kept after the component's own id. */
  extraDescribedBy?: string,
): FieldWiring {
  const fieldId = id ?? `field-${name}`;
  const hasError = Boolean(errors?.length);
  return {
    id: fieldId,
    hasError,
    describedBy:
      [hasError ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined, extraDescribedBy]
        .filter(Boolean)
        .join(" ") || undefined,
  };
}

/** Border, size and focus styling shared by every bordered control. Scope-agnostic: only tokens. */
export function controlClass(hasError: boolean, extra?: string): string {
  return cn(
    "w-full rounded-field border-[length:var(--b9-border)] bg-surface px-4 text-body text-fg",
    "placeholder:text-fg-muted disabled:cursor-not-allowed disabled:opacity-60",
    hasError ? "border-danger" : "border-line-strong",
    extra,
  );
}

/** Label above the control, then hint or error. Errors carry a ✕ so colour is never the only cue. */
export function FieldShell({
  label,
  hint,
  errors,
  wiring,
  children,
}: Pick<FieldBase, "label" | "hint" | "errors"> & { wiring: FieldWiring; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={wiring.id} className="text-body font-bold text-fg">
        {label}
      </label>
      {children}
      <FieldMessages hint={hint} errors={errors} wiring={wiring} />
    </div>
  );
}

/** Hint (hidden while an error shows) and the error line. Errors carry a ✕ so colour is never the only cue. */
export function FieldMessages({
  hint,
  errors,
  wiring,
}: Pick<FieldBase, "hint" | "errors"> & { wiring: FieldWiring }) {
  return (
    <>
      {hint && !wiring.hasError ? (
        <p id={`${wiring.id}-hint`} className="text-small text-fg-muted">
          {hint}
        </p>
      ) : null}
      {wiring.hasError ? (
        <p id={`${wiring.id}-error`} role="alert" className="text-small font-bold text-danger">
          ✕ {errors?.join(" ")}
        </p>
      ) : null}
    </>
  );
}
