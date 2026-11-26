import { describe, expect, it, vi } from "vitest";
import { html } from "../../../test/render";
import { Table, TBody, Td, Th, THead, Tr } from "./DataTable";
import { Pagination } from "./Pagination";
import { StatusDot } from "./StatusDot";
import { Tabs } from "./Tabs";
import { Tag } from "./Tag";

const href = (p: number) => `?page=${p}`;

describe("DataTable", () => {
  it("scrolls inside its own wrapper", () => {
    const out = html(
      <Table>
        <THead>
          <Tr>
            <Th>ชื่อ</Th>
          </Tr>
        </THead>
        <TBody>
          <Tr>
            <Td>ก</Td>
          </Tr>
        </TBody>
      </Table>,
    );
    expect(out).toMatch(/^<div class="[^"]*overflow-x-auto/);
    expect(out).toContain("<table");
  });
  it("styles the header row and separates body rows", () => {
    const head = html(
      <table>
        <THead>
          <Tr>
            <Th>ชื่อ</Th>
          </Tr>
        </THead>
      </table>,
    );
    expect(head).toContain("bg-surface-subtle");
    expect(head).toContain("text-micro text-fg-muted");
    expect(head).not.toContain("font-bold");
    const body = html(
      <table>
        <TBody>
          <Tr>
            <Td>ก</Td>
          </Tr>
        </TBody>
      </table>,
    );
    expect(body).toContain("border-line");
    expect(body).toContain("var(--b9-border)");
  });
  it("tints a hovered body row but not the header row", () => {
    const body = html(
      <table>
        <TBody>
          <Tr>
            <Td>ก</Td>
          </Tr>
        </TBody>
      </table>,
    );
    expect(body).toContain("hover:bg-surface-subtle");
    const head = html(
      <table>
        <THead>
          <Tr>
            <Th>ชื่อ</Th>
          </Tr>
        </THead>
      </table>,
    );
    expect(head).not.toContain("hover:bg-surface-subtle");
  });
  it("Th defaults to scope col and maps sort to aria-sort", () => {
    expect(html(<Th>ชื่อ</Th>)).toContain('scope="col"');
    expect(html(<Th scope="row">ชื่อ</Th>)).toContain('scope="row"');
    expect(html(<Th sort="asc">ชื่อ</Th>)).toContain('aria-sort="ascending"');
    expect(html(<Th sort="desc">ชื่อ</Th>)).toContain('aria-sort="descending"');
    expect(html(<Th sort="none">ชื่อ</Th>)).toContain('aria-sort="none"');
    expect(html(<Th>ชื่อ</Th>)).not.toContain("aria-sort");
  });
  it("Th and Td align numbers and Td emphasises or mutes", () => {
    expect(html(<Th numeric>จำนวน</Th>)).toContain("text-right tabular-nums");
    expect(html(<Td numeric>3</Td>)).toContain("tabular-nums");
    expect(html(<Td numeric>3</Td>)).toContain("text-right");
    expect(html(<Th>ชื่อ</Th>)).not.toContain("font-bold");
    expect(html(<Td primary>ก</Td>)).not.toContain("font-bold");
    expect(html(<Td primary>ก</Td>)).toContain("text-fg");
    expect(html(<Td primary>ก</Td>)).not.toContain("text-fg-2");
    expect(html(<Td>ก</Td>)).toContain("text-fg-2");
    expect(html(<Td muted>ก</Td>)).toContain("text-fg-muted");
  });
});

describe("Pagination", () => {
  it("states the range, or that there is nothing", () => {
    expect(html(<Pagination page={1} pageSize={20} total={0} hrefFor={href} />)).toContain(
      "ไม่มีรายการ",
    );
    expect(html(<Pagination page={1} pageSize={20} total={128} hrefFor={href} />)).toContain(
      "แสดง 1–20 จาก 128 รายการ",
    );
  });
  it("is a labelled nav with the current page marked", () => {
    const out = html(<Pagination page={4} pageSize={20} total={128} hrefFor={href} />);
    expect(out).toContain('<nav aria-label="การแบ่งหน้า"');
    expect(out).toMatch(/<a[^>]*aria-current="page"[^>]*>4<\/a>/);
    expect(out).toMatch(/<a[^>]*href="\?page=4"[^>]*>4<\/a>/);
    expect(out).toContain('href="?page=3"');
    expect(out).toContain('href="?page=5"');
    expect(out).toContain('aria-label="หน้าก่อนหน้า"');
    expect(out).toContain('aria-label="หน้าถัดไป"');
    expect(out).toContain("min-h-control-sm");
    expect(out).toContain("min-w-control-sm");
  });
  it("renders previous and next as disabled spans at the ends", () => {
    const first = html(<Pagination page={1} pageSize={20} total={128} hrefFor={href} />);
    expect(first).toMatch(/<span[^>]*aria-disabled="true"[^>]*>[\s\S]*?หน้าก่อนหน้า<\/span>/);
    expect(first).not.toContain('href="?page=0"');
    const last = html(<Pagination page={7} pageSize={20} total={128} hrefFor={href} />);
    expect(last).toMatch(/<span[^>]*aria-disabled="true"[^>]*>[\s\S]*?หน้าถัดไป<\/span>/);
    expect(last).not.toContain('href="?page=8"');
  });
  it("names a disabled step with hidden text, not an aria-label on a span", () => {
    const first = html(<Pagination page={1} pageSize={20} total={128} hrefFor={href} />);
    const span = first.match(/<span[^>]*aria-disabled="true"[^>]*>[\s\S]*?<\/span>/)?.[0] ?? "";
    expect(span).toContain("sr-only");
    expect(span).toContain("หน้าก่อนหน้า");
    expect(span).not.toContain("aria-label");
    expect(span).not.toContain("href");
  });
  it("renders no nav landmark for a single page or none", () => {
    for (const total of [0, 4]) {
      const out = html(<Pagination page={1} pageSize={20} total={total} hrefFor={href} />);
      expect(out).not.toContain("<nav");
      expect(out).toContain("<p");
    }
  });
  it("shows the clamped range and marks the last page for a page past the end", () => {
    const out = html(<Pagination page={99} pageSize={20} total={128} hrefFor={href} />);
    expect(out).toContain("แสดง 121–128 จาก 128 รายการ");
    expect(out).toMatch(/<a[^>]*aria-current="page"[^>]*>7<\/a>/);
  });
  it("asks hrefFor for the neighbours of a middle page and of the last page", () => {
    const middle = vi.fn(href);
    html(<Pagination page={4} pageSize={20} total={128} hrefFor={middle} />);
    const mid = middle.mock.calls.map(([p]) => p);
    expect(mid).toEqual(expect.arrayContaining([3, 5]));
    const end = vi.fn(href);
    html(<Pagination page={7} pageSize={20} total={128} hrefFor={end} />);
    const last = end.mock.calls.map(([p]) => p);
    expect(last).toContain(6);
    expect(last).not.toContain(8);
  });
  it("shows only the count for a single page or none", () => {
    for (const total of [0, 4]) {
      const hrefFor = vi.fn(href);
      const out = html(<Pagination page={1} pageSize={20} total={total} hrefFor={hrefFor} />);
      expect(out).not.toContain("<a");
      expect(out).not.toContain("aria-disabled");
      expect(out).not.toContain("aria-current");
      expect(hrefFor).not.toHaveBeenCalled();
    }
  });
  it("calls hrefFor only for real pages", () => {
    const hrefFor = vi.fn(href);
    html(<Pagination page={1} pageSize={20} total={128} hrefFor={hrefFor} />);
    const asked = hrefFor.mock.calls.map(([p]) => p);
    expect(asked.every((p) => p >= 1 && p <= 7)).toBe(true);
  });
});

describe("StatusDot", () => {
  it("always shows the word next to a hidden dot", () => {
    for (const tone of ["ok", "draft", "off", "danger"] as const) {
      const out = html(<StatusDot tone={tone}>เปิดใช้งาน</StatusDot>);
      expect(out).toContain("เปิดใช้งาน");
      expect(out).toMatch(/<span[^>]*aria-hidden="true"/);
    }
  });
  it("maps tones to dot styles", () => {
    expect(html(<StatusDot tone="ok">ก</StatusDot>)).toContain("bg-success");
    expect(html(<StatusDot tone="draft">ก</StatusDot>)).toContain("border-attention");
    expect(html(<StatusDot tone="off">ก</StatusDot>)).toContain("bg-line-strong");
    expect(html(<StatusDot tone="off">ก</StatusDot>)).toContain("text-fg-muted");
    expect(html(<StatusDot tone="danger">ก</StatusDot>)).toContain("bg-danger");
  });
});

describe("Tag", () => {
  it("maps tones", () => {
    expect(html(<Tag>ก</Tag>)).toContain("bg-surface-muted text-fg-2");
    expect(html(<Tag tone="attention">สองนิ้วพร้อมกัน</Tag>)).toContain(
      "bg-attention-soft text-attention",
    );
    expect(html(<Tag tone="primary">ก</Tag>)).toContain("bg-primary-soft text-primary-press");
    expect(html(<Tag tone="attention">สองนิ้วพร้อมกัน</Tag>)).toContain("สองนิ้วพร้อมกัน");
  });
  it("sizes an optional icon", () => {
    const out = html(<Tag icon={<svg />}>ก</Tag>);
    expect(out).toContain("size-icon-sm");
    expect(html(<Tag>ก</Tag>)).not.toContain("size-icon-sm");
  });
});

describe("Tabs", () => {
  const items = [
    { href: "?s=all", label: "ทั้งหมด", count: 4, active: true },
    { href: "?s=draft", label: "ฉบับร่าง", count: 2 },
  ];
  it("is a labelled nav and marks the active tab", () => {
    const out = html(<Tabs items={items} />);
    expect(out).toContain('<nav aria-label="แท็บ"');
    expect(html(<Tabs label="สถานะ" items={items} />)).toContain('aria-label="สถานะ"');
    expect(out.match(/aria-current="page"/g)).toHaveLength(1);
    expect(out).toMatch(/<a[^>]*aria-current="page"[^>]*>/);
    expect(out).toMatch(
      /<a[^>]*href="\?s=all"[^>]*aria-current="page"|<a[^>]*aria-current="page"[^>]*href="\?s=all"/,
    );
  });
  it("styles active and inactive tabs and their count pills", () => {
    const [active, inactive] = html(<Tabs items={items} />).match(/<a[\s\S]*?<\/a>/g) ?? [];
    expect(active).toContain("text-primary font-bold");
    expect(active).toContain("border-primary");
    expect(active).toContain("bg-primary-soft text-primary-press");
    expect(inactive).toContain("text-fg-2");
    expect(inactive).not.toContain("border-primary");
    expect(inactive).toContain("bg-surface-muted text-fg-2");
    expect(html(<Tabs items={[{ href: "/", label: "ก" }]} />)).not.toContain("rounded-full");
  });
});
