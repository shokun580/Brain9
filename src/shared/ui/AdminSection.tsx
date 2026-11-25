import { useId, type ReactNode } from "react";

export type AdminSectionProps = {
  title: string;
  /** Quiet figure next to the title, e.g. "12 รายการ". */
  count?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

/** A flat block of an admin page: a heading with a line under it, never a box. */
export function AdminSection({ title, count, description, action, children }: AdminSectionProps) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="mt-8 first:mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b-[length:var(--b9-border)] border-line-strong pb-2">
        <div className="min-w-0 flex-1 basis-60">
          <h2 id={headingId} className="text-heading font-bold text-fg">
            {title}
            {count ? (
              <span className="ml-2 text-body font-normal text-fg-muted">{count}</span>
            ) : null}
          </h2>
          {description ? <p className="mt-1 text-small text-fg-muted">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="pt-4">{children}</div>
    </section>
  );
}
