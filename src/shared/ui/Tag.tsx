import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type Tone = "neutral" | "attention" | "primary";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-muted text-fg-2",
  attention: "bg-attention-soft text-attention",
  primary: "bg-primary-soft text-primary-press",
};

export type TagProps = { tone?: Tone; icon?: ReactNode; children: ReactNode };

/** A small label for a property of a row (a setting, a mode). Not a status: use StatusDot. */
export function Tag({ tone = "neutral", icon, children }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-control px-2 py-0.5 text-micro font-bold",
        tones[tone],
      )}
    >
      {icon ? (
        <span aria-hidden="true" className="flex size-icon-sm shrink-0 items-center justify-center">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}
