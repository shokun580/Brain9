import type { ReactNode } from "react";

export type SegmentedControlProps = {
  name: string;
  /** Accessible name of the group; visually hidden. */
  legend: string;
  defaultValue: string;
  options: { value: string; label: string; icon?: ReactNode }[];
  /** Called with the option's value when the user picks it. */
  onValueChange?: (value: string) => void;
};

/** A compact single choice on native radios (no JavaScript); the selected segment is filled. */
export function SegmentedControl({
  name,
  legend,
  defaultValue,
  options,
  onValueChange,
}: SegmentedControlProps) {
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="sr-only">{legend}</legend>
      <div className="inline-flex max-w-full flex-wrap rounded-control border-[length:var(--b9-border)] border-line-strong">
        {options.map((option) => (
          <label
            key={option.value}
            className="relative flex min-h-control first:rounded-l-control last:rounded-r-control not-first:border-l-[length:var(--b9-border)] not-first:border-line-strong cursor-pointer items-center gap-1.5 bg-surface text-fg px-4 text-body has-[:checked]:bg-ink has-[:checked]:font-bold has-[:checked]:text-on-ink has-[:focus-visible]:z-10 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={option.value === defaultValue}
              onChange={onValueChange ? () => onValueChange(option.value) : undefined}
              className="sr-only"
            />
            {option.icon ? (
              <span
                aria-hidden="true"
                className="flex size-icon-sm shrink-0 items-center justify-center"
              >
                {option.icon}
              </span>
            ) : null}
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
