"use client";

import type { ReactNode } from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import {
  DASHES,
  Marker,
  SHAPES,
  colour,
  formatChartValue,
  type ChartProps,
  type ChartSeries,
} from "./chart-helpers";

// The one file that imports Recharts (ESLint enforces it). Chart.tsx loads it with
// next/dynamic so a page without a chart never downloads the library.

export type ChartDrawingProps = {
  kind: "line" | "bar";
  data: ChartProps["data"];
  xKey: string;
  series: ChartSeries[];
  unit?: string;
  yMax?: number;
  stacked?: boolean;
};

const AXIS_LINE = { stroke: "var(--b9-line-strong)" };
const MARGIN = { top: 8, right: 16, bottom: 0, left: 0 };

function ChartTooltip({
  active,
  payload,
  label,
  unit,
}: TooltipContentProps & { unit?: string }): ReactNode {
  if (!active || payload.length === 0) return null;
  return (
    <div className="rounded-field border-[length:var(--b9-border)] border-line bg-surface px-3 py-2 text-small shadow-overlay">
      <p className="font-bold text-fg">{label}</p>
      <ul>
        {payload.map((entry) => (
          <li key={String(entry.dataKey)} className="text-fg-2">
            {entry.name}:{" "}
            <span className="tabular-nums">
              {formatChartValue(entry.value as string | number | null | undefined, unit)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function axes({ xKey, yMax }: Pick<ChartDrawingProps, "xKey" | "yMax">) {
  return [
    <CartesianGrid key="grid" stroke="var(--b9-line)" vertical={false} />,
    <XAxis
      key="x"
      dataKey={xKey}
      tickLine={false}
      axisLine={AXIS_LINE}
      minTickGap={8}
      tickMargin={8}
    />,
    <YAxis
      key="y"
      width={48}
      tickLine={false}
      axisLine={false}
      domain={[0, yMax ?? "auto"]}
      allowDecimals={false}
    />,
  ];
}

export default function ChartDrawing(props: ChartDrawingProps) {
  const { kind, data, series, unit, stacked } = props;
  const tooltip = (cursor: object) => (
    <Tooltip
      isAnimationActive={false}
      cursor={cursor}
      content={(content) => <ChartTooltip {...content} unit={unit} />}
    />
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      {kind === "line" ? (
        <RechartsLineChart data={[...data]} margin={MARGIN} accessibilityLayer={false}>
          {axes(props)}
          {tooltip({ stroke: "var(--b9-line-strong)" })}
          {series.map((s, i) => {
            const shape = SHAPES[i] ?? "circle";
            return (
              <Line
                key={s.key}
                dataKey={s.key}
                name={s.label}
                stroke={colour(i)}
                strokeWidth={3}
                strokeDasharray={DASHES[i]}
                isAnimationActive={false}
                dot={(dot) => (
                  <g key={`${s.key}-${dot.index}`} fill={colour(i)}>
                    <Marker shape={shape} x={dot.cx ?? 0} y={dot.cy ?? 0} r={4.5} />
                  </g>
                )}
                activeDot={false}
              />
            );
          })}
        </RechartsLineChart>
      ) : (
        <RechartsBarChart data={[...data]} margin={MARGIN} accessibilityLayer={false}>
          {axes(props)}
          {tooltip({ fill: "var(--b9-surface-muted)" })}
          {series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={colour(i)}
              stackId={stacked ? "stack" : undefined}
              stroke={stacked ? "var(--b9-surface)" : undefined}
              isAnimationActive={false}
            />
          ))}
        </RechartsBarChart>
      )}
    </ResponsiveContainer>
  );
}
