import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export type TextLinkProps = {
  children: ReactNode;
  /** Where the link goes. Without it the link is a `<button>` and needs `onClick`. */
  href?: string;
  onClick?: () => void;
  /** Layout only (margin, placement). */
  className?: string;
};

/**
 * A quiet way to another screen, shown as underlined words: an entry that must not compete
 * with the screen's one primary button. Always words, never an icon alone. The row is as tall
 * as a small control, so the target stays large enough in both scopes.
 */
export function TextLink({ children, href, onClick, className }: TextLinkProps) {
  const classes = cn(
    "inline-flex min-h-control-sm items-center rounded-control px-1 text-small font-bold text-primary-press underline underline-offset-4",
    className,
  );
  if (href !== undefined) {
    return (
      <Link href={href} onClick={onClick} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
