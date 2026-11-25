import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, Ref } from "react";
import { cn } from "@/shared/lib/cn";

type Variant = "primary" | "secondary" | "quiet" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary active:bg-primary-press",
  secondary:
    "bg-surface border-[length:var(--b9-border)] border-line-strong text-fg active:bg-surface-muted",
  quiet: "bg-transparent text-fg-2 active:bg-surface-muted",
  danger: "bg-danger text-on-danger active:opacity-90",
};

type Own = {
  variant?: Variant;
  size?: "default" | "sm";
  fullWidth?: boolean;
  /** Square button with no visible text; requires aria-label. */
  iconOnly?: boolean;
  href?: string;
  /** Forwarded to the `<button>` element only (React 19 passes `ref` as a prop). */
  ref?: Ref<HTMLButtonElement>;
};

export type ButtonProps = Own &
  (ButtonHTMLAttributes<HTMLButtonElement> | AnchorHTMLAttributes<HTMLAnchorElement>);

/**
 * Button for both scopes: size, radius and type scale come from the active `data-ui` tokens.
 * Labels may wrap so large text sizes never clip.
 */
export function Button({
  variant = "primary",
  size = "default",
  fullWidth,
  iconOnly,
  className,
  ref,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-control font-bold",
    size === "sm" ? "min-h-control-sm text-body" : "min-h-control text-lead",
    iconOnly ? "aspect-square px-0" : "px-6",
    fullWidth && "w-full",
    "disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:opacity-60",
    variants[variant],
    className,
  );

  if ("href" in props && props.href !== undefined) {
    const { href, ...anchor } = props as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
    return <Link href={href} className={classes} {...anchor} />;
  }
  const { type = "button", ...button } = props as ButtonHTMLAttributes<HTMLButtonElement>;
  return <button ref={ref} type={type} className={classes} {...button} />;
}
