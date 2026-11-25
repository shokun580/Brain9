import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type Variant = "primary" | "secondary" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary active:bg-primary-press",
  secondary: "bg-surface text-text border-2 border-border-strong active:bg-surface-2",
  danger: "bg-danger text-on-danger",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

/**
 * Elderly-friendly button: at least 64px tall, large bold label, visible focus ring.
 * Always give it a text label — never an icon alone.
 */
export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-16 items-center justify-center gap-2 rounded-card px-6 text-lg font-bold",
        "focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-focus",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
