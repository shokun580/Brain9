import { Check, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export type ResultBannerProps = {
  tone: "success" | "danger";
  title: string;
  detail?: string;
  /** Render the title as a heading of this level (result screens want a heading in words). */
  headingLevel?: 1 | 2 | 3;
};

/**
 * Outcome of an answer. The tone is the icon plus the words, never the colour alone.
 * A `role="status"` region is announced reliably only when it stays mounted and its content
 * changes, so callers should keep the banner mounted and swap its props.
 */
export function ResultBanner({ tone, title, detail, headingLevel }: ResultBannerProps) {
  const Title = headingLevel ? (`h${headingLevel}` as const) : "p";
  const Icon = tone === "success" ? Check : X;
  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-4 rounded-panel border-[length:var(--b9-border)] border-edge p-5",
        tone === "success" ? "bg-success-soft" : "bg-danger-soft",
      )}
    >
      <span
        className={cn(
          "flex size-14 shrink-0 items-center justify-center rounded-full",
          tone === "success" ? "bg-success text-on-primary" : "bg-danger text-on-danger",
        )}
      >
        <Icon aria-hidden="true" strokeWidth={2.4} className="size-8" />
      </span>
      <div className="min-w-0">
        <Title className="text-title font-bold text-fg">{title}</Title>
        {detail ? <p className="mt-1 text-body text-fg-2">{detail}</p> : null}
      </div>
    </div>
  );
}
