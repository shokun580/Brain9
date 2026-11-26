import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { BrandMark } from "./BrandMark";

export type StaffAuthShellProps = {
  brand: string;
  /** Who this door is for, under the brand name ("สำหรับผู้ดูแล"). */
  roleLabel: string;
  footer?: ReactNode;
  /** Short name of a non-production deployment (`local`, `staging`); never a secret. */
  environmentLabel?: string;
  /** For the /design page only: do not fill the viewport. */
  embedded?: boolean;
  children: ReactNode;
};

/**
 * Frame of the staff sign-in screen, in the admin scope: the brand, one narrow column in the
 * middle of a plain page, and the footer of the admin area. No card, as on every admin form.
 * Staff are not signed in yet, so there is no menu and nothing about a person. The page inside
 * owns its `<h1>` (PageHeader) and its form.
 */
export function StaffAuthShell({
  brand,
  roleLabel,
  footer = "Brain9 ระบบฝึกสมองผู้สูงอายุ",
  environmentLabel,
  embedded,
  children,
}: StaffAuthShellProps) {
  return (
    <div
      data-ui="admin"
      className={cn("flex flex-col bg-surface text-fg", embedded ? "py-4" : "min-h-dvh")}
    >
      <div className="m-auto flex w-full max-w-[26rem] flex-col gap-5 px-4 py-10">
        <div className="flex items-center gap-3">
          <BrandMark className="size-10" />
          <div className="min-w-0 leading-tight">
            <p className="text-heading font-bold text-fg">{brand}</p>
            <p className="text-small text-fg-muted">{roleLabel}</p>
          </div>
        </div>
        <main className="border-t border-line pt-6">{children}</main>
        <footer className="text-micro text-fg-muted">
          {footer}
          {environmentLabel ? ` · ${environmentLabel}` : null}
        </footer>
      </div>
    </div>
  );
}
