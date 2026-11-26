import { ArrowUp, Minus, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type DeltaTone = "up" | "flat" | "warn";

const deltaStyle: Record<DeltaTone, { className: string; icon: ReactNode }> = {
  up: {
    className: "text-success",
    icon: <ArrowUp aria-hidden="true" className="size-icon-sm shrink-0" />,
  },
  flat: {
    className: "text-fg-muted",
    icon: <Minus aria-hidden="true" className="size-icon-sm shrink-0" />,
  },
  warn: {
    className: "text-attention",
    icon: <TriangleAlert aria-hidden="true" className="size-icon-sm shrink-0" />,
  },
};

export type StatTileProps = {
  icon: ReactNode;
  label: string;
  value: string;
  unit?: string;
  /** The text always carries the meaning; the marker icon repeats the tone. */
  delta?: { text: string; tone: DeltaTone };
};

/** One figure on the dashboard: icon tile, label, big number and an optional change line. */
export function StatTile({ icon, label, value, unit, delta }: StatTileProps) {
  const style = delta ? deltaStyle[delta.tone] : undefined;
  return (
    <div className="flex items-start gap-3 rounded-panel border-[length:var(--b9-border)] border-line bg-surface p-4">
      <span
        aria-hidden="true"
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-panel",
          delta?.tone === "warn"
            ? "bg-attention-soft text-attention"
            : "bg-primary-soft text-primary-press",
        )}
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-small text-fg-muted">{label}</span>
        <span className="flex items-baseline gap-1.5">
          <span className="text-title font-bold tabular-nums text-fg">{value}</span>
          {unit ? <span className="text-small text-fg-muted">{unit}</span> : null}
        </span>
        {delta && style ? (
          <span className={cn("flex items-center gap-1 text-small font-bold", style.className)}>
            {style.icon}
            {delta.text}
          </span>
        ) : null}
      </div>
    </div>
  );
}
