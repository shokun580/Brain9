import { cn } from "@/shared/lib/cn";

export type BrandMarkProps = {
  /** Size and placement, for example `size-9`. The mark is square; default `size-10`. */
  className?: string;
  /** Accessible name. Leave out when the mark sits next to the product name (decorative). */
  label?: string;
};

// Column and row origins of the nine cells; the diagonal from top-left is lit.
const POSITIONS = [9, 25, 41] as const;
const cells = POSITIONS.flatMap((y, row) =>
  POSITIONS.map((x, column) => ({ x, y, lit: row === column })),
);

/**
 * The Brain9 mark: a rounded tile holding the 3x3 exercise grid with the top-left to
 * bottom-right diagonal lit. It uses the colour tokens, so it follows the theme (including
 * high contrast). `src/app/icon.svg` is the same drawing with literal colours, for places
 * that cannot read CSS variables (favicon, README).
 */
export function BrandMark({ className, label }: BrandMarkProps) {
  // `cn` does not merge conflicting utilities, so a passed size replaces the default.
  const a11y = label
    ? ({ role: "img", "aria-label": label } as const)
    : ({ "aria-hidden": true, focusable: "false" } as const);
  const cell = (lit: boolean) =>
    cells
      .filter((c) => c.lit === lit)
      .map((c) => <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width="14" height="14" rx="3.5" />);
  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className ?? "size-10")}
      {...a11y}
    >
      <rect width="64" height="64" rx="14" className="fill-primary" />
      <g className="fill-on-primary" fillOpacity={0.32}>
        {cell(false)}
      </g>
      <g className="fill-on-primary">{cell(true)}</g>
    </svg>
  );
}
