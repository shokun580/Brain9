import { Check, X } from "lucide-react";

export type ToastProps = { message: string; tone?: "success" | "danger" };

/** Short confirmation after an action. Presentational: the caller decides when to show it. */
export function Toast({ message, tone = "success" }: ToastProps) {
  const Icon = tone === "danger" ? X : Check;
  return (
    <div
      role="status"
      className="inline-flex items-center gap-2 rounded-control border-[length:var(--b9-border)] border-edge bg-ink px-4 py-3 text-body font-bold text-white shadow-overlay"
    >
      <Icon aria-hidden="true" className="size-icon shrink-0 text-white" />
      {message}
    </div>
  );
}
