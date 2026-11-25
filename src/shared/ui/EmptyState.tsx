import type { ReactNode } from "react";

export type EmptyStateProps = { title: string; description?: string; action?: ReactNode };

/** Text and an optional action; deliberately no illustration and no box. */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      <p className="text-heading font-bold text-fg">{title}</p>
      {description ? <p className="text-body text-fg-2">{description}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
