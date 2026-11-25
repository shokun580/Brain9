import { describe, expect, it } from "vitest";
import { html } from "../../../test/render";
import { Td } from "./DataTable";
import {
  AdminPageSkeleton,
  ListRowSkeleton,
  SkeletonBlock,
  SkeletonLine,
  SkeletonRegion,
  StatTileSkeleton,
  TableSkeleton,
} from "./Skeleton";

const columns = [{ label: "ชื่อคอร์ส" }, { label: "จำนวน", numeric: true }];

function count(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

function classOf(markup: string, tag: string): string {
  return markup.match(new RegExp(`<${tag}[^>]*class="([^"]*)"`))?.[1] ?? "";
}

describe("SkeletonRegion", () => {
  it("is a busy status with a hidden text label and a decorative body", () => {
    const out = html(
      <SkeletonRegion label="กำลังโหลดรายการคอร์ส">
        <i />
      </SkeletonRegion>,
    );
    expect(out).toMatch(/<div[^>]*role="status"[^>]*aria-busy="true"/);
    expect(out).toMatch(/<[a-z]+ class="sr-only">กำลังโหลดรายการคอร์ส</);
    expect(out).toMatch(/<div aria-hidden="true"><i><\/i><\/div>/);
  });
});

describe("SkeletonLine", () => {
  it("draws a shimmering bar that stops under reduced motion", () => {
    const out = html(<SkeletonLine />);
    expect(out).toContain("bg-skeleton");
    expect(out).toContain("animate-skeleton");
    expect(out).toContain("motion-reduce:animate-none");
  });
  it("takes its height from the text size it stands in for", () => {
    const out = html(<SkeletonLine text="heading" />);
    expect(out).toContain("h-[1lh]");
    expect(out).toContain("text-heading");
    expect(html(<SkeletonLine />)).toContain("text-body");
  });
  it("sets the width", () => {
    expect(html(<SkeletonLine width="sm" />)).toContain("w-1/4");
    expect(html(<SkeletonLine width="full" />)).toContain("w-full");
  });
});

describe("SkeletonBlock", () => {
  it("uses the size tokens", () => {
    expect(html(<SkeletonBlock shape="icon" />)).toContain("size-icon");
    expect(html(<SkeletonBlock shape="icon-tile" />)).toContain("size-11");
    expect(html(<SkeletonBlock shape="control" />)).toContain("h-control");
    expect(html(<SkeletonBlock shape="control-sm" />)).toContain("h-control-sm");
    expect(html(<SkeletonBlock shape="control" />)).toContain("animate-skeleton");
  });
});

describe("TableSkeleton", () => {
  it("renders the real header labels and the requested number of body rows", () => {
    const out = html(<TableSkeleton label="กำลังโหลดตาราง" columns={columns} rows={4} />);
    expect(out).toContain("ชื่อคอร์ส");
    expect(out).toContain("จำนวน");
    expect(count(out, "<tr")).toBe(1 + 4);
    expect(count(out, "<td")).toBe(4 * 2);
  });
  it("defaults to three body rows and can show two lines per cell", () => {
    const one = html(<TableSkeleton label="x" columns={columns} />);
    expect(count(one, "<tr")).toBe(1 + 3);
    const two = html(<TableSkeleton label="x" columns={columns} rows={1} lines={2} />);
    expect(count(two, "animate-skeleton")).toBe(2 * 2);
  });
  it("uses the same cell padding as a real Td", () => {
    const real = classOf(
      html(
        <table>
          <tbody>
            <tr>
              <Td>x</Td>
            </tr>
          </tbody>
        </table>,
      ),
      "td",
    );
    const out = html(<TableSkeleton label="x" columns={columns} rows={1} />);
    const skeletonCell = classOf(out, "td").split(" ");
    const padding = real.split(" ").filter((c) => /^(px|py)-/.test(c));
    expect(padding.length).toBeGreaterThan(0);
    for (const cls of padding) {
      expect(skeletonCell).toContain(cls);
    }
  });
});

describe("ListRowSkeleton and StatTileSkeleton", () => {
  it("renders the requested number of rows with the row height of ListRow", () => {
    const out = html(<ListRowSkeleton label="กำลังโหลดรายการ" rows={4} />);
    expect(count(out, "min-h-control")).toBe(4);
  });
  it("renders the requested number of tiles", () => {
    const out = html(<StatTileSkeleton label="กำลังโหลดตัวเลข" count={3} />);
    expect(count(out, "size-11")).toBe(3);
  });
});

describe("AdminPageSkeleton", () => {
  it("has one status region with a header and a table", () => {
    const out = html(<AdminPageSkeleton />);
    expect(count(out, 'role="status"')).toBe(1);
    expect(out).toContain("<table");
  });
});

describe("no skeleton is interactive", () => {
  const all = [
    html(
      <SkeletonRegion label="x">
        <SkeletonLine />
        <SkeletonBlock shape="control" />
      </SkeletonRegion>,
    ),
    html(<TableSkeleton label="x" columns={columns} />),
    html(<ListRowSkeleton label="x" />),
    html(<StatTileSkeleton label="x" />),
    html(<AdminPageSkeleton />),
  ];
  it.each(all.map((markup, i) => [i, markup] as const))("markup %i", (_i, markup) => {
    expect(markup).not.toMatch(/<a[\s>]/);
    expect(markup).not.toContain("<button");
    expect(markup).not.toContain("<input");
    expect(markup.toLowerCase()).not.toContain("tabindex");
  });
});
