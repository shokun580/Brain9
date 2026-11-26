import { describe, expect, it } from "vitest";
import { html } from "../../../test/render";
import { BarChart, LineChart } from "./Chart";
import { buildTableRows, formatChartValue, limitSeries } from "./chart-helpers";

const data = [
  { week: "สัปดาห์ 1", a: 62, b: 40 },
  { week: "สัปดาห์ 2", a: 65, b: null },
  { week: "สัปดาห์ 3", a: 70.5, b: 52 },
];
const base = {
  title: "ความแม่นยำที่ศูนย์ตัวอย่าง",
  summary: "สัปดาห์นี้ความแม่นยำสูงขึ้น 8 จุด",
  data,
  xKey: "week",
  xLabel: "สัปดาห์",
  unit: "%",
};
const one = [{ key: "a", label: "ศูนย์ตัวอย่าง ก" }];
const two = [...one, { key: "b", label: "ศูนย์ตัวอย่าง ข" }];

describe("formatChartValue", () => {
  it("shows a dash for a missing value", () => {
    expect(formatChartValue(null, "%")).toBe("–");
    expect(formatChartValue(undefined, "ครั้ง")).toBe("–");
  });
  it("joins value and unit, tight for %, spaced for words", () => {
    expect(formatChartValue(62, "%")).toBe("62%");
    expect(formatChartValue(12, "ครั้ง")).toBe("12 ครั้ง");
    expect(formatChartValue(70.5)).toBe("70.5");
  });
  it("groups thousands and trims long decimals", () => {
    expect(formatChartValue(1234.5678)).toBe("1,234.57");
  });
  it("passes text through", () => {
    expect(formatChartValue("ดี", "%")).toBe("ดี");
  });
});

describe("limitSeries", () => {
  it("keeps at most the first four series", () => {
    const many = ["a", "b", "c", "d", "e"].map((key) => ({ key, label: key }));
    expect(limitSeries(many).map((s) => s.key)).toEqual(["a", "b", "c", "d"]);
  });
  it("accepts none", () => {
    expect(limitSeries([])).toEqual([]);
  });
});

describe("buildTableRows", () => {
  it("makes one row per point with one cell per series", () => {
    const rows = buildTableRows(data, "week", two, "%");
    expect(rows).toHaveLength(3);
    expect(rows[0]).toEqual({ x: "สัปดาห์ 1", cells: ["62%", "40%"] });
    expect(rows[1]?.cells).toEqual(["65%", "–"]);
    expect(rows[2]?.cells[0]).toBe("70.5%");
  });
  it("shows a dash when the key is absent from a point", () => {
    expect(buildTableRows([{ week: "x" }], "week", one)[0]?.cells).toEqual(["–"]);
  });
});

describe.each([
  ["LineChart", LineChart],
  ["BarChart", BarChart],
])("%s", (_name, Chart) => {
  it("renders a figure with caption, summary and drawing label", () => {
    const markup = html(<Chart {...base} series={two} />);
    expect(markup).toContain("<figure");
    expect(markup).toMatch(/<figcaption[^>]*>ความแม่นยำที่ศูนย์ตัวอย่าง<\/figcaption>/);
    expect(markup).toContain(base.summary);
    expect(markup).toContain('role="img"');
    expect(markup).toContain(`aria-label="${base.title}. ${base.summary}"`);
  });

  it("lists every series in a legend of words when there are several", () => {
    const markup = html(<Chart {...base} series={two} />);
    expect(markup).toContain("ศูนย์ตัวอย่าง ก");
    expect(markup).toContain("ศูนย์ตัวอย่าง ข");
    expect(markup).toContain('aria-label="คำอธิบายสัญลักษณ์"');
  });

  it("has no legend for a single series", () => {
    expect(html(<Chart {...base} series={one} />)).not.toContain("คำอธิบายสัญลักษณ์");
  });

  it("puts the same numbers in a native details table", () => {
    const markup = html(<Chart {...base} series={two} />);
    expect(markup).toContain("<details");
    expect(markup).toContain("<summary");
    expect(markup).toContain("ดูตัวเลขเป็นตาราง");
    expect(markup).toContain(">สัปดาห์</th>");
    expect(markup).toContain(">ศูนย์ตัวอย่าง ข</th>");
    expect(markup).toContain("62%");
    expect(markup).toContain("70.5%");
    expect(markup).toContain(">–</td>");
  });

  it("draws at most four series and does not throw with none", () => {
    const five = ["a", "b", "a", "b", "a"].map((key, i) => ({ key, label: `ชุด ${i + 1}` }));
    const markup = html(<Chart {...base} series={five} />);
    expect(markup).toContain("ชุด 4");
    expect(markup).not.toContain("ชุด 5");
    expect(() => html(<Chart {...base} series={[]} />)).not.toThrow();
  });
});
