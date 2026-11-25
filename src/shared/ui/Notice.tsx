import { Check, Info, TriangleAlert, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type Tone = "primary" | "success" | "danger" | "attention";

const tones: Record<Tone, { box: string; icon: string; Icon: typeof Info }> = {
  primary: { box: "bg-primary-soft", icon: "text-primary", Icon: Info },
  success: { box: "bg-success-soft", icon: "text-success", Icon: Check },
  danger: { box: "bg-danger-soft", icon: "text-danger", Icon: X },
  attention: { box: "bg-attention-soft", icon: "text-attention", Icon: TriangleAlert },
};

export type NoticeProps = { tone: Tone; title?: string; children: ReactNode };

/** Inline message. The icon always accompanies the tone so colour is never the only signal. */
export function Notice({ tone, title, children }: NoticeProps) {
  const { box, icon, Icon } = tones[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-panel px-4 py-3 text-fg", box)}
    >
      <Icon aria-hidden="true" className={cn("mt-0.5 size-6 shrink-0", icon)} />
      <div className="text-small">
        {title ? <p className="text-body font-bold">{title}</p> : null}
        <div>{children}</div>
      </div>
    </div>
  );
}
