import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type Tone = "ok" | "draft" | "off" | "danger";

const dots: Record<Tone, string> = {
  ok: "bg-success",
  draft: "border-[length:var(--b9-border)] border-attention bg-transparent",
  off: "bg-line-strong",
  danger: "bg-danger",
};

export type StatusDotProps = { tone: Tone; children: ReactNode };

/** A status as a dot plus a word — the word is always there, so colour is never the only cue. */
export function StatusDot({ tone, children }: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-body",
        tone === "off" ? "text-fg-muted" : "text-fg",
      )}
    >
      <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", dots[tone])} />
      {children}
    </span>
  );
}
