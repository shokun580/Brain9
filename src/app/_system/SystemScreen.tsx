import type { ReactNode } from "react";
import { BrandMark } from "@/shared/ui";

export type SystemScreenProps = {
  title: string;
  description: string;
  /** The one primary action. */
  action: ReactNode;
  /** An optional quieter second action. */
  secondaryAction?: ReactNode;
  /** Small muted line under the help text, e.g. "รหัสอ้างอิง 1a2b3c". */
  reference?: string;
};

/**
 * The one look of every system screen (not found, error). These files render outside both
 * scope layouts, so the screen brings the elderly scope itself, and it is the same for every
 * visitor: an admin URL that answers "not found" must look like any other unknown address.
 * Plain text only: no card, no illustration, no animation.
 */
export function SystemScreen({
  title,
  description,
  action,
  secondaryAction,
  reference,
}: SystemScreenProps) {
  return (
    <div data-ui="elder" className="flex min-h-dvh flex-col bg-page text-fg">
      <main className="m-auto flex w-full max-w-[640px] flex-col items-center gap-4 px-5 py-10 text-center">
        <BrandMark className="size-14" />
        <h1 className="text-title font-bold text-fg">{title}</h1>
        <p className="text-lead text-fg-2">{description}</p>
        <div className="mt-2 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          {action}
          {secondaryAction}
        </div>
        <p className="mt-2 w-full border-t-[length:var(--b9-border)] border-line pt-4 text-body text-fg-2">
          ต้องการความช่วยเหลือ แจ้งเจ้าหน้าที่ศูนย์ได้เลย
        </p>
        {reference ? <p className="text-small text-fg-muted">{reference}</p> : null}
      </main>
    </div>
  );
}
