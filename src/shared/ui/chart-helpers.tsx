export type ChartSeries = { key: string; label: string };

export type ChartProps = {
  /** What the chart shows; rendered as its visible caption. */
  title: string;
  /** One sentence with the main finding, shown under the chart ("สัปดาห์นี้ฝึกมากขึ้น 12 ครั้ง"). */
  summary: string;
  /** One object per point on the x axis. */
  data: ReadonlyArray<Readonly<Record<string, string | number | null>>>;
  /** Key of the x-axis category in each data object. */
  xKey: string;
  /** Column header for the x-axis category in the table of numbers. */
  xLabel: string;
  /**
   * 1 to 4 series, drawn in `--chart-1` … `--chart-4` order. Only the first four are drawn
   * (a fifth would have no colour, dash or shape of its own); an empty list draws an empty
   * chart and a table with the x column only, and never throws.
   */
  series: ReadonlyArray<ChartSeries>;
  /** Unit shown after values in the tooltip and the table ("%", "ครั้ง", "วินาที"). */
  unit?: string;
  /** Upper bound of the y axis; default: fitted to the data. The axis always starts at 0. */
  yMax?: number;
};

// Pure helpers and small drawings shared by Chart.tsx (the frame, the legend, the table) and
// ChartDrawing.tsx (the Recharts part, loaded lazily). Nothing here imports Recharts.

const MAX_SERIES = 4;
const MISSING = "–";

/** The series that get drawn: the first four. */
export function limitSeries(series: ReadonlyArray<ChartSeries>): ChartSeries[] {
  return series.slice(0, MAX_SERIES);
}

const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

/**
 * A value with its unit for the tooltip and the table. A missing value is an en dash.
 * `%` sticks to the number ("62%"); a word unit is spaced ("12 ครั้ง").
 */
export function formatChartValue(value: string | number | null | undefined, unit?: string): string {
  if (value === null || value === undefined || value === "") return MISSING;
  if (typeof value === "string") return value;
  if (!Number.isFinite(value)) return MISSING;
  const text = numberFormat.format(value);
  if (!unit) return text;
  return unit === "%" ? `${text}%` : `${text} ${unit}`;
}

export type ChartTableRow = { x: string; cells: string[] };

/** The rows of the table of numbers: the x label, then one formatted cell per series. */
export function buildTableRows(
  data: ChartProps["data"],
  xKey: string,
  series: ReadonlyArray<ChartSeries>,
  unit?: string,
): ChartTableRow[] {
  return data.map((point) => ({
    x: String(point[xKey] ?? MISSING),
    cells: series.map((s) => formatChartValue(point[s.key], unit)),
  }));
}

// Line series 1 is solid; 2 to 4 each have their own dash and point shape, so the lines can
// be told apart without colour.
export const DASHES = [undefined, "8 5", "2 4", "10 4 2 4"] as const;
export const SHAPES = ["circle", "square", "diamond", "triangle"] as const;
export type Shape = (typeof SHAPES)[number];

export const colour = (index: number) => `var(--chart-${index + 1})`;

export function Marker({ shape, x, y, r }: { shape: Shape; x: number; y: number; r: number }) {
  switch (shape) {
    case "square":
      return <rect x={x - r} y={y - r} width={r * 2} height={r * 2} />;
    case "diamond":
      return (
        <polygon
          points={`${x},${y - r * 1.3} ${x + r * 1.3},${y} ${x},${y + r * 1.3} ${x - r * 1.3},${y}`}
        />
      );
    case "triangle":
      return (
        <polygon points={`${x},${y - r * 1.25} ${x + r * 1.2},${y + r} ${x - r * 1.2},${y + r}`} />
      );
    default:
      return <circle cx={x} cy={y} r={r} />;
  }
}
