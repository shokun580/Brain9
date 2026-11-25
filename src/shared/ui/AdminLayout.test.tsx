import { describe, expect, it } from "vitest";
import { html } from "../../../test/render";
import { AdminSection } from "./AdminSection";
import { TableCard } from "./TableCard";

describe("AdminSection", () => {
  const out = html(
    <AdminSection
      title="ผู้ใช้งาน"
      count="12 รายการ"
      description="รายชื่อตัวอย่าง"
      action={<a href="/new">เพิ่ม</a>}
    >
      <p>เนื้อหา</p>
    </AdminSection>,
  );
  it("is a labelled section with one h2, the count and the action", () => {
    expect(out).toMatch(/<section[^>]*aria-labelledby="([^"]+)"/);
    expect(out.match(/<h2/g)).toHaveLength(1);
    expect(out).toContain("12 รายการ");
    expect(out).toContain("text-fg-muted");
    expect(out).toContain("shrink-0");
    expect(out).toContain("รายชื่อตัวอย่าง");
    expect(out).toContain("เนื้อหา");
  });
  it("separates the title from the count with a real space", () => {
    expect(out).toMatch(/ผู้ใช้งาน(<!-- -->)? (<!-- -->)?<span[^>]*>12 รายการ/);
  });
  it("links the heading id to aria-labelledby", () => {
    const labelled = /aria-labelledby="([^"]+)"/.exec(out)?.[1];
    expect(labelled).toBeTruthy();
    expect(out).toContain(`id="${labelled}"`);
  });
  it("is flat: a line under the heading and no box", () => {
    expect(out).toContain("border-b-[length:var(--b9-border)]");
    expect(out).toContain("border-line-strong");
    expect(out).not.toContain("rounded-panel");
    expect(out).not.toContain("bg-surface");
  });
});

describe("TableCard", () => {
  it("is a thin bordered container without a shadow", () => {
    const out = html(<TableCard>x</TableCard>);
    expect(out).toContain("rounded-panel");
    expect(out).toContain("border-line");
    expect(out).not.toContain("shadow");
  });
  it("renders toolbar and footer only when given", () => {
    const bare = html(<TableCard>x</TableCard>);
    expect(bare).not.toContain("border-b border-line");
    expect(bare).not.toContain("border-t border-line");
    const full = html(
      <TableCard toolbar={<span>กรอง</span>} footer={<span>หน้า</span>}>
        x
      </TableCard>,
    );
    expect(full).toContain("กรอง");
    expect(full).toContain("หน้า");
    expect(full).toContain("border-b border-line");
    expect(full).toContain("border-t border-line");
  });
});
