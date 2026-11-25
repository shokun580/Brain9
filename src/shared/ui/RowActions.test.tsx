import { describe, expect, it } from "vitest";
import { html } from "../../../test/render";
import { RowActions } from "./RowActions";

const primary = { label: "ดูข้อมูล", href: "/admin/users/1" };
const more = [
  { label: "แก้ไข", href: "/admin/users/1/edit" },
  { label: "ประวัติ", href: "/admin/users/1/history" },
];

describe("RowActions", () => {
  it("renders the primary action as a link", () => {
    const out = html(<RowActions primary={primary} rowLabel="ผู้ใช้ตัวอย่าง 01" />);
    expect(out).toContain('href="/admin/users/1"');
    expect(out).toContain("ดูข้อมูล");
    expect(out).toContain("underline");
  });

  it("renders no button without more", () => {
    const out = html(<RowActions primary={primary} rowLabel="ผู้ใช้ตัวอย่าง 01" />);
    expect(out).not.toContain("<button");
    expect(out).not.toContain("popover");
  });

  it("opens a popover list of links from a labelled button", () => {
    const out = html(<RowActions primary={primary} more={more} rowLabel="ผู้ใช้ตัวอย่าง 01" />);
    const target = /popoverTarget="([^"]+)"/.exec(out)?.[1];
    expect(target).toBeTruthy();
    expect(out).toContain(`id="${target}"`);
    expect(out).toContain('popover="auto"');
    expect(out).toContain('aria-label="เพิ่มเติม: ผู้ใช้ตัวอย่าง 01"');
    expect(out).toContain('type="button"');
    expect(out).not.toContain("aria-haspopup");
    // primary link + one per menu item
    expect(out.match(/<a /g)).toHaveLength(3);
    expect(out).toContain('href="/admin/users/1/edit"');
    expect(out).toContain("min-h-control-sm");
  });

  it("does not bold the primary link", () => {
    const out = html(<RowActions primary={primary} rowLabel="ผู้ใช้ตัวอย่าง 01" />);
    expect(/<a [^>]*class="[^"]*font-bold/.test(out)).toBe(false);
  });

  it("shows the row label as the first non-interactive line that labels the list", () => {
    const out = html(<RowActions primary={primary} more={more} rowLabel="ผู้ใช้ตัวอย่าง 01" />);
    const popover = /<div id="[^"]+" popover="auto".*<\/div>/.exec(out)?.[0] ?? "";
    expect(popover).toContain("ผู้ใช้ตัวอย่าง 01");
    const labelId = /aria-labelledby="([^"]+)"/.exec(popover)?.[1];
    expect(labelId).toBeTruthy();
    const label = new RegExp(`<p id="${labelId}"[^>]*>ผู้ใช้ตัวอย่าง 01</p>`).exec(popover);
    expect(label).not.toBeNull();
    expect(label?.[0]).toContain("text-micro");
    expect(label?.[0]).toContain("text-fg-muted");
    expect(label?.[0]).not.toContain("tabindex");
    // the label comes before the first link, and the list is no longer labelled by aria-label
    expect(popover.indexOf("<p ")).toBeLessThan(popover.indexOf("<a "));
    expect(/<ul[^>]*aria-label=/.test(popover)).toBe(false);
    expect(out).not.toContain("role=");
  });

  it("flips above the button near the viewport bottom and shares one anchor name", () => {
    const out = html(<RowActions primary={primary} more={more} rowLabel="ผู้ใช้ตัวอย่าง 01" />);
    expect(out).toContain("supports-[position-area:bottom]:[position-try-fallbacks:flip-block]");
    expect(out).toContain("supports-[position-area:bottom]:my-1");
    const name = /anchor-name:(--[\w-]+)/.exec(out)?.[1];
    expect(name).toBeTruthy();
    expect(out).toContain(`position-anchor:${name}`);
  });

  it("uses a custom more label", () => {
    const out = html(
      <RowActions primary={primary} more={more} moreLabel="อื่นๆ" rowLabel="แถวตัวอย่าง" />,
    );
    expect(out).toContain('aria-label="อื่นๆ: แถวตัวอย่าง"');
  });

  it("gives two instances different ids", () => {
    const out = html(
      <>
        <RowActions primary={primary} more={more} rowLabel="ก" />
        <RowActions primary={primary} more={more} rowLabel="ข" />
      </>,
    );
    const ids = [...out.matchAll(/popoverTarget="([^"]+)"/g)].map((m) => m[1]);
    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
  });
});
