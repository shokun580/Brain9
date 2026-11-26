import { Check, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type Tone = "neutral" | "primary" | "success" | "danger" | "attention";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-muted text-fg-2",
  primary: "bg-primary-soft text-primary-press",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  attention: "bg-attention-soft text-attention",
};

export type BadgeProps = { tone?: Tone; children: ReactNode };

/** Status pill. Success and danger always carry an icon so colour is never the only signal. */
export function Badge({ tone = "neutral", children }: BadgeProps) {
  const Icon = tone === "success" ? Check : tone === "danger" ? X : null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-edge px-3 py-1 text-small font-bold",
        tones[tone],
      )}
    >
      {Icon ? <Icon aria-hidden="true" className="size-icon-sm shrink-0" /> : null}
      {children}
    </span>
  );
}
