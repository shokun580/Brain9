"use client";

import dynamic from "next/dynamic";
import { Table, TBody, THead, Td, Th, Tr } from "./DataTable";
import { SkeletonLine, SkeletonRegion } from "./Skeleton";
import {
  DASHES,
  Marker,
  SHAPES,
  buildTableRows,
  colour,
  limitSeries,
  type ChartProps,
  type ChartSeries,
  type ChartTableRow,
} from "./chart-helpers";

export type { ChartProps, ChartSeries } from "./chart-helpers";

// Recharts is large and this file is re-exported by the `@/shared/ui` barrel, so the drawing
// is loaded on demand: a page that shows no chart never downloads the library. The fallback
// has the drawing's height, so nothing jumps when it arrives.
const ChartDrawing = dynamic(() => import("./ChartDrawing"), {
  loading: () => (
    <SkeletonRegion label="กำลังโหลดแผนภูมิ">
      <div className="h-72 w-full pt-2">
        <SkeletonLine width="full" />
      </div>
    </SkeletonRegion>
  ),
});

function LegendSwatch({ kind, index }: { kind: "line" | "bar"; index: number }) {
  const c = colour(index);
  if (kind === "bar") {
    return (
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        focusable="false"
        className="size-icon-sm shrink-0"
      >
        <rect x="1" y="1" width="14" height="14" style={{ fill: c }} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 16" aria-hidden="true" focusable="false" className="h-4 w-10 shrink-0">
      <line
        x1="0"
        y1="8"
        x2="40"
        y2="8"
        strokeWidth="3"
        strokeDasharray={DASHES[index]}
        style={{ stroke: c }}
      />
      <g style={{ fill: c }}>
        <Marker shape={SHAPES[index] ?? "circle"} x={20} y={8} r={4.5} />
      </g>
    </svg>
  );
}

function Legend({ series, kind }: { series: ChartSeries[]; kind: "line" | "bar" }) {
  return (
    <ul aria-label="คำอธิบายสัญลักษณ์" className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
      {series.map((s, i) => (
        <li key={s.key} className="flex items-center gap-2 text-small text-fg-2">
          <LegendSwatch kind={kind} index={i} />
          {s.label}
        </li>
      ))}
    </ul>
  );
}

function NumbersTable({
  xLabel,
  series,
  rows,
  title,
}: {
  xLabel: string;
  series: ChartSeries[];
  rows: ChartTableRow[];
  title: string;
}) {
  return (
    <details className="mt-3">
      <summary className="inline-flex min-h-control-sm cursor-pointer items-center text-small text-primary-press underline">
        ดูตัวเลขเป็นตาราง
      </summary>
      <div className="mt-2">
        <Table aria-label={`ตัวเลขของ${title}`}>
          <THead>
            <Tr>
              <Th>{xLabel}</Th>
              {series.map((s) => (
                <Th key={s.key} numeric>
                  {s.label}
                </Th>
              ))}
            </Tr>
          </THead>
          <TBody>
            {rows.map((row, i) => (
              <Tr key={`${row.x}-${i}`}>
                <Td primary>{row.x}</Td>
                {row.cells.map((cell, j) => (
                  <Td key={series[j]?.key ?? j} numeric>
                    {cell}
                  </Td>
                ))}
              </Tr>
            ))}
          </TBody>
        </Table>
      </div>
    </details>
  );
}

const DRAWING = "h-72 w-full";

function ChartFrame(props: ChartProps & { kind: "line" | "bar"; stacked?: boolean }) {
  const series = limitSeries(props.series);
  const rows = buildTableRows(props.data, props.xKey, series, props.unit);
  return (
    <figure className="m-0">
      <figcaption className="text-body font-bold text-fg">{props.title}</figcaption>
      {series.length > 1 ? <Legend series={series} kind={props.kind} /> : null}
      {/* role="img" gives the drawing one text alternative; the SVG inside is hidden. */}
      <div role="img" aria-label={`${props.title}. ${props.summary}`} className="mt-3">
        <div aria-hidden="true" className={DRAWING}>
          <ChartDrawing
            kind={props.kind}
            data={props.data}
            xKey={props.xKey}
            series={series}
            unit={props.unit}
            yMax={props.yMax}
            stacked={props.stacked}
          />
        </div>
      </div>
      <p className="mt-2 text-body text-fg-2">{props.summary}</p>
      <NumbersTable xLabel={props.xLabel} series={series} rows={rows} title={props.title} />
    </figure>
  );
}

/**
 * A line chart for a trend over time (admin screens only). One to four series: series 1 is a
 * solid line with round points, 2 to 4 differ by dash pattern and point shape as well as colour.
 * `null` in the data leaves a gap in the line. Only the first four series are drawn.
 */
export function LineChart(props: ChartProps): React.JSX.Element {
  return <ChartFrame {...props} kind="line" />;
}

/**
 * A bar chart for comparing counts or amounts (admin screens only). Several series are grouped
 * side by side, or stacked with `stacked`; the legend lists them in the order of the bars (or,
 * stacked, from the bottom up) and the table below carries the numbers.
 */
export function BarChart(props: ChartProps & { stacked?: boolean }): React.JSX.Element {
  return <ChartFrame {...props} kind="bar" />;
}
