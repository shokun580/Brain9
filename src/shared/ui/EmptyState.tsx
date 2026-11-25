import type { ReactNode } from "react";

export type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Render the title as a heading of this level. Default: plain text, so it never adds an outline entry. */
  headingLevel?: 1 | 2 | 3;
};

/** Text and an optional action; deliberately no illustration and no box. */
export function EmptyState({ title, description, action, headingLevel }: EmptyStateProps) {
  const Title = headingLevel ? (`h${headingLevel}` as const) : "p";
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      <Title className="text-heading font-bold text-fg">{title}</Title>
      {description ? <p className="text-body text-fg-2">{description}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
