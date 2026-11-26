import type { ReactNode } from "react";

export type ExampleProps = {
  title: string;
  /** The line to copy. Every component the demo shows must appear in it. */
  importLine?: string;
  note?: string;
  /** 4 under a sub-heading (the default); 3 when the demo sits directly under the part's h2. */
  headingLevel?: 3 | 4;
  children: ReactNode;
};

/** One demo: the live component(s), then the import line in a code line. Page chrome. */
export function Example({ title, importLine, note, headingLevel = 4, children }: ExampleProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div className="mt-8">
      <Heading data-outline="example" className="text-lead font-bold text-fg">
        {title}
      </Heading>
      {note ? (
        <p className="mt-0.5 mb-2 text-small text-fg-muted">{note}</p>
      ) : (
        <div className="h-2" />
      )}
      {children}
      {importLine ? (
        <p className="mt-2">
          <code className="block overflow-x-auto rounded-control bg-surface-muted px-3 py-2 font-mono text-small whitespace-pre text-fg-2">
            {importLine}
          </code>
        </p>
      ) : null}
    </div>
  );
}
