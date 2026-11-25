import { cn } from "@/shared/lib/cn";

export type MeterProps = {
  label: string;
  value: number;
  max: number;
  /** Visible words that say the same thing as the bar, e.g. "ฝึกแล้ว 3 จาก 5 วัน". */
  valueText: string;
  /** Draw one block per whole unit of `max` instead of a continuous bar. */
  segments?: boolean;
};

const MAX_SEGMENTS = 31;

/** Progress toward a target. The bar is decoration; `valueText` is always visible. */
export function Meter({ label, value, max, valueText, segments }: MeterProps) {
  const top = Number.isFinite(max) && max > 0 ? max : 0;
  const now = top > 0 && Number.isFinite(value) ? Math.min(Math.max(value, 0), top) : 0;
  const percent = top > 0 ? (now / top) * 100 : 0;
  const blocks = segments ? Math.min(Math.floor(top), MAX_SEGMENTS) : 0;
  const lit = top > 0 ? Math.round((now / top) * blocks) : 0;

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={top}
      aria-valuenow={now}
      aria-valuetext={valueText}
    >
      <p className="text-small font-bold text-fg-2">{label}</p>
      {blocks > 0 ? (
        <div aria-hidden="true" className="mt-2 flex gap-1.5">
          {Array.from({ length: blocks }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-3 flex-1 rounded-full border",
                i < lit ? "border-primary bg-primary" : "border-edge bg-surface-muted",
              )}
            />
          ))}
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="mt-2 h-3 overflow-hidden rounded-full border border-edge bg-surface-muted"
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
        </div>
      )}
      <p className="mt-1.5 text-body font-bold text-fg">{valueText}</p>
    </div>
  );
}
