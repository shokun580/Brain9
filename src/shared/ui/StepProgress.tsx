/** "ขั้นที่ X จาก Y"; `current` is clamped into 1..total. Empty when `total` is not a usable count. */
export function stepLabel(current: number, total: number): string {
  if (!Number.isFinite(total) || !Number.isFinite(current)) return "";
  const last = Math.floor(total);
  if (last < 1) return "";
  const step = Math.min(Math.max(Math.floor(current), 1), last);
  return `ขั้นที่ ${step} จาก ${last}`;
}

export type StepProgressProps = { current: number; total: number };

/** One step at a time: the words carry the meaning, the bars only echo it. */
export function StepProgress({ current, total }: StepProgressProps) {
  const label = stepLabel(current, total);
  if (!label) return null;
  const last = Math.floor(total);
  const step = Math.min(Math.max(Math.floor(current), 1), last);
  return (
    <div>
      <p className="text-small font-bold text-primary-press">{label}</p>
      <div aria-hidden="true" className="mt-2 flex gap-1.5">
        {Array.from({ length: last }, (_, i) => (
          <span
            key={i}
            className={
              i < step
                ? "h-2 flex-1 rounded-full border border-primary bg-primary"
                : "h-2 flex-1 rounded-full border border-edge bg-surface-muted"
            }
          />
        ))}
      </div>
    </div>
  );
}
