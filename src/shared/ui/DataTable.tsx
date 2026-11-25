import type {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";
import { cn } from "@/shared/lib/cn";

/** A wide table scrolls inside its own wrapper instead of widening the page. */
export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full border-collapse text-left text-body", className)} {...props} />
    </div>
  );
}

export function THead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "bg-surface-subtle text-micro text-fg-muted border-b-[length:var(--b9-border)] border-line",
        className,
      )}
      {...props}
    />
  );
}

export function TBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  // The hover tint lives here so the header row (inside THead) never gets it.
  return <tbody className={cn("[&>tr]:hover:bg-surface-subtle", className)} {...props} />;
}

export function Tr({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("border-b-[length:var(--b9-border)] border-line last:border-b-0", className)}
      {...props}
    />
  );
}

export type ThProps = ThHTMLAttributes<HTMLTableCellElement> & {
  numeric?: boolean;
  sort?: "asc" | "desc" | "none";
};

const ariaSort = { asc: "ascending", desc: "descending", none: "none" } as const;

export function Th({ numeric, sort, className, scope = "col", ...props }: ThProps) {
  return (
    <th
      scope={scope}
      aria-sort={sort ? ariaSort[sort] : undefined}
      className={cn("px-4 py-2.5", numeric && "text-right tabular-nums", className)}
      {...props}
    />
  );
}

export type TdProps = TdHTMLAttributes<HTMLTableCellElement> & {
  numeric?: boolean;
  primary?: boolean;
  muted?: boolean;
};

export function Td({ numeric, primary, muted, className, ...props }: TdProps) {
  return (
    <td
      className={cn(
        "px-4 py-3 align-middle",
        muted ? "text-fg-muted" : primary ? "text-fg" : "text-fg-2",
        numeric && "text-right tabular-nums",
        className,
      )}
      {...props}
    />
  );
}
