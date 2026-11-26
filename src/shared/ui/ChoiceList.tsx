import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { FieldMessages, fieldWiring } from "./Field";

export type ChoiceListProps = {
  name: string;
  legend: string;
  defaultValue?: string;
  options: {
    value: string;
    title: string;
    description?: string;
    badge?: ReactNode;
    disabled?: boolean;
  }[];
  /** Short help text; hidden while an error is shown. */
  hint?: string;
  /** Validation messages for this field (from ActionResult.fieldErrors). */
  errors?: string[];
  required?: boolean;
  /** Called with the option's value when the user picks it. */
  onValueChange?: (value: string) => void;
};

/**
 * Large single-choice list on native radios (no JavaScript). The radio is visually hidden but
 * still focusable; the label shows the focus ring and the checked state (tint plus a ✓ mark).
 */
export function ChoiceList({
  name,
  legend,
  defaultValue,
  options,
  hint,
  errors,
  required,
  onValueChange,
}: ChoiceListProps) {
  const wiring = fieldWiring(name, undefined, hint, errors);
  return (
    <fieldset
      aria-describedby={wiring.describedBy}
      aria-invalid={wiring.hasError ? true : undefined}
      className="m-0 min-w-0 border-0 p-0"
    >
      <legend className="mb-3 p-0 text-lead font-bold text-fg">{legend}</legend>
      <div className="flex flex-col gap-3">
        {options.map((option) => (
          <label
            key={option.value}
            className="group flex min-h-control cursor-pointer items-center gap-4 rounded-panel border-[length:var(--b9-border)] border-line-strong bg-surface p-4 has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-surface-muted has-[:disabled]:opacity-70 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={option.value === defaultValue}
              disabled={option.disabled}
              required={required}
              onChange={onValueChange ? () => onValueChange(option.value) : undefined}
              className="sr-only"
            />
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full border-[length:var(--b9-border)] border-line-strong bg-surface text-on-primary group-has-[:checked]:border-primary group-has-[:checked]:bg-primary"
            >
              <Check className="size-5 opacity-0 group-has-[:checked]:opacity-100" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
              <span className="text-lead font-bold text-fg">{option.title}</span>
              {option.description ? (
                <span className="text-small text-fg-2">{option.description}</span>
              ) : null}
              {option.badge ? <span className="mt-1.5">{option.badge}</span> : null}
            </span>
          </label>
        ))}
      </div>
      {hint || wiring.hasError ? (
        <div className="mt-2 flex flex-col gap-2">
          <FieldMessages hint={hint} errors={errors} wiring={wiring} />
        </div>
      ) : null}
    </fieldset>
  );
}
