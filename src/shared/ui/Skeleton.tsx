import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Table, TBody, Td, Th, THead, Tr } from "./DataTable";

/** Grey fill with the moving light band; the band stops under reduced motion. */
const fill = "bg-skeleton animate-skeleton motion-reduce:animate-none";

export type SkeletonRegionProps = { label: string; children: ReactNode };

/**
 * A loading area. Screen readers hear the label once; the grey shapes are decorative.
 * Skeletons never contain a link, button or input, so nothing in them can take focus.
 */
export function SkeletonRegion({ label, children }: SkeletonRegionProps) {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

const lineWidth = { sm: "w-1/4", md: "w-1/2", lg: "w-3/4", full: "w-full" } as const;
const lineText = {
  body: "text-body",
  small: "text-small",
  heading: "text-heading",
  title: "text-title",
} as const;

export type SkeletonLineProps = {
  width?: keyof typeof lineWidth;
  text?: keyof typeof lineText;
};

/**
 * One line of text. The outer box is exactly one line tall in the given text size, so the
 * layout does not jump when the real text arrives; the bar inside is a little shorter.
 */
export function SkeletonLine({ width = "md", text = "body" }: SkeletonLineProps) {
  return (
    <span className={cn("block h-[1lh]", lineText[text], lineWidth[width])}>
      <span className={cn("block h-[0.7em] w-full translate-y-[0.15em] rounded-full", fill)} />
    </span>
  );
}

const blockShape = {
  icon: "size-icon rounded-field",
  "icon-tile": "size-11 rounded-panel",
  control: "h-control w-full rounded-control",
  "control-sm": "h-control-sm w-full rounded-control",
} as const;

export type SkeletonBlockProps = { shape: keyof typeof blockShape };

/** A solid shape the size of an icon, an icon tile or a button. */
export function SkeletonBlock({ shape }: SkeletonBlockProps) {
  return <span className={cn("block shrink-0", blockShape[shape], fill)} />;
}

export type SkeletonColumn = { label?: string; numeric?: boolean };

type TableShapeProps = { columns: SkeletonColumn[]; rows: number; lines: 1 | 2 };

/** The table itself, without a region, so a page skeleton can hold it inside its own. */
function TableShape({ columns, rows, lines }: TableShapeProps) {
  return (
    <Table>
      <THead>
        <Tr>
          {columns.map((column, index) => (
            <Th key={index} numeric={column.numeric}>
              {column.label ?? <SkeletonLine text="small" width="sm" />}
            </Th>
          ))}
        </Tr>
      </THead>
      <TBody>
        {Array.from({ length: rows }, (_, row) => (
          <Tr key={row}>
            {columns.map((column, index) => (
              <Td key={index} numeric={column.numeric}>
                <span className={cn("flex flex-col gap-1", column.numeric && "items-end")}>
                  <SkeletonLine width={column.numeric ? "sm" : "lg"} />
                  {lines === 2 ? <SkeletonLine text="small" width="md" /> : null}
                </span>
              </Td>
            ))}
          </Tr>
        ))}
      </TBody>
    </Table>
  );
}

export type TableSkeletonProps = {
  label: string;
  columns: { label: string; numeric?: boolean }[];
  rows?: number;
  lines?: 1 | 2;
};

/** A table that is loading: the real header labels, grey bars in the body. */
export function TableSkeleton({ label, columns, rows = 3, lines = 1 }: TableSkeletonProps) {
  return (
    <SkeletonRegion label={label}>
      <TableShape columns={columns} rows={rows} lines={lines} />
    </SkeletonRegion>
  );
}

/** Same box as `ListRow`: min height, gap and padding come from the same classes. */
export function ListRowSkeleton({ label, rows = 3 }: { label: string; rows?: number }) {
  return (
    <SkeletonRegion label={label}>
      {Array.from({ length: rows }, (_, row) => (
        <div
          key={row}
          className="flex min-h-control items-center gap-4 border-b-[length:var(--b9-border)] border-line py-4"
        >
          <SkeletonBlock shape="icon" />
          <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
            <SkeletonLine width="lg" />
            <SkeletonLine text="small" width="md" />
          </span>
          <SkeletonBlock shape="icon" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

/** Same box as `StatTile`: icon tile, label, big figure. */
export function StatTileSkeleton({ label, count = 4 }: { label: string; count?: number }) {
  return (
    <SkeletonRegion label={label}>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3">
        {Array.from({ length: count }, (_, tile) => (
          <div
            key={tile}
            className="flex items-start gap-3 rounded-panel border-[length:var(--b9-border)] border-line bg-surface p-4"
          >
            <SkeletonBlock shape="icon-tile" />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <SkeletonLine text="small" width="md" />
              <SkeletonLine text="title" width="sm" />
            </div>
          </div>
        ))}
      </div>
    </SkeletonRegion>
  );
}

const pageColumns: SkeletonColumn[] = [{}, {}, { numeric: true }, {}];

/** Admin page that is loading: the page-header lines and one table. */
export function AdminPageSkeleton() {
  return (
    <SkeletonRegion label="กำลังโหลดหน้านี้">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <SkeletonLine text="title" width="md" />
          <SkeletonLine width="lg" />
        </div>
        <TableShape columns={pageColumns} rows={5} lines={1} />
      </div>
    </SkeletonRegion>
  );
}
