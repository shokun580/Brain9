import Link from "next/link";
import { Fragment, type ReactNode } from "react";

export type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Earlier items link with `href`; the last one is the current page. */
  breadcrumbs?: { label: string; href?: string }[];
};

/** Top of an admin page: breadcrumb, h1, quiet description and one primary action. */
export function PageHeader({ title, description, action, breadcrumbs }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-2">
      {breadcrumbs?.length ? (
        <nav aria-label="เส้นทาง" className="text-small text-fg-muted">
          <ol className="m-0 flex list-none flex-wrap items-center gap-x-2 p-0">
            {breadcrumbs.map((crumb, index) => {
              const last = index === breadcrumbs.length - 1;
              return (
                <Fragment key={`${index}-${crumb.label}`}>
                  <li>
                    {last ? (
                      <span className="text-fg" aria-current="page">
                        {crumb.label}
                      </span>
                    ) : crumb.href ? (
                      <Link href={crumb.href} className="text-fg-muted underline">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span>{crumb.label}</span>
                    )}
                  </li>
                  {last ? null : (
                    <li aria-hidden="true" className="text-line-strong">
                      /
                    </li>
                  )}
                </Fragment>
              );
            })}
          </ol>
        </nav>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1 basis-60">
          <h1 className="text-title font-bold text-fg">{title}</h1>
          {description ? <p className="mt-1 text-body text-fg-muted">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}
