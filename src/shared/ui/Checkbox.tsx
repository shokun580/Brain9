import { Check } from "lucide-react";
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

/**
 * Checkbox drawn by the design system: a rounded box that fills with the primary colour and
 * shows a ✓ when ticked. The real `<input>` stays in the page (hidden from sight only), so the
 * keyboard, forms and screen readers work as with a native checkbox. The whole row (box +
 * label) is the touch target, and the box grows with the text size.
 */
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
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={wiring.id}
        className="group relative flex min-h-control cursor-pointer items-center gap-3 rounded-control text-body text-fg has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus"
      >
        <input
          id={wiring.id}
          name={name}
          type="checkbox"
          aria-invalid={wiring.hasError || undefined}
          aria-describedby={wiring.describedBy}
          className="sr-only"
          {...props}
        />
        <span
          aria-hidden="true"
          className={cn(
            "flex size-[1.5em] shrink-0 items-center justify-center rounded-[0.35em] border-[length:var(--b9-border)] bg-surface text-on-primary group-has-[:checked]:border-primary group-has-[:checked]:bg-primary",
            wiring.hasError ? "border-danger" : "border-line-strong",
          )}
        >
          <Check
            strokeWidth={3}
            className="size-[1em] opacity-0 group-has-[:checked]:opacity-100"
          />
        </span>
        <span>{label}</span>
      </label>
      <FieldMessages hint={hint} errors={errors} wiring={wiring} />
    </div>
  );
}
