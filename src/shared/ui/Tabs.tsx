import { cn } from "@/shared/lib/cn";

export type TabsProps = {
  items: { href: string; label: string; count?: number; active?: boolean }[];
  /** Accessible name of the navigation. */
  label?: string;
};

/** Link tabs: each one is a URL, so the current tab survives reloads and sharing. */
export function Tabs({ items, label = "แท็บ" }: TabsProps) {
  return (
    <nav aria-label={label} className="border-b-[length:var(--b9-border)] border-line">
      <ul className="m-0 flex list-none flex-wrap gap-x-5 p-0">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "-mb-px inline-flex min-h-control items-center gap-2 border-b-2 text-body",
                item.active
                  ? "border-primary text-primary font-bold"
                  : "border-transparent text-fg-2",
              )}
            >
              {item.label}
              {item.count !== undefined ? (
                <span
                  className={cn(
                    "rounded-full px-2 text-micro font-bold tabular-nums",
                    item.active
                      ? "bg-primary-soft text-primary-press"
                      : "bg-surface-muted text-fg-2",
                  )}
                >
                  {item.count}
                </span>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
