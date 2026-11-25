import { describe, expect, it } from "vitest";
import { html } from "../../../test/render";
import { TabBar, TabBarView } from "./TabBar";

const items = [
  { href: "/home", label: "หน้าหลัก", icon: <i /> },
  { href: "/courses", label: "คอร์ส", icon: <i /> },
];

describe("TabBar", () => {
  it("renders a labelled nav with one link per item, tolerating a null pathname", () => {
    const t = html(<TabBar items={items} />);
    expect((t.match(/<a /g) ?? []).length).toBe(2);
    expect(t).toContain("หน้าหลัก");
    expect(t).toContain("คอร์ส");
    expect(t).toContain("<nav");
    expect(t).toContain('aria-label="เมนูหลัก"');
    expect(t).not.toContain("aria-current");
  });

  it("derives the column count from the number of items", () => {
    const three = [...items, { href: "/results", label: "ผลลัพธ์", icon: <i /> }];
    const four = [...three, { href: "/me", label: "ฉัน", icon: <i /> }];
    expect(html(<TabBar items={three} />)).toContain(
      "grid-template-columns:repeat(3, minmax(0, 1fr))",
    );
    expect(html(<TabBar items={four} />)).toContain(
      "grid-template-columns:repeat(4, minmax(0, 1fr))",
    );
    expect(html(<TabBar items={four} />)).not.toContain("grid-cols-4");
  });
});

describe("TabBarView", () => {
  it("marks the tab of the current path and no other", () => {
    const t = html(<TabBarView items={items} pathname="/courses/abc" />);
    expect((t.match(/aria-current="page"/g) ?? []).length).toBe(1);
    expect(t).toMatch(/<a aria-current="page"[^>]*href="\/courses"/);
  });

  it("marks no tab while the pathname is unknown", () => {
    const t = html(<TabBarView items={items} pathname={null} />);
    expect(t).toContain("<nav");
    expect(t).not.toContain("aria-current");
  });

  it("renders nothing on a hidden path", () => {
    expect(html(<TabBarView items={items} pathname="/play/1" hideOn={["/play"]} />)).toBe("");
  });

  it("names the bar so it stays put during a page transition", () => {
    expect(html(<TabBarView items={items} pathname="/home" />)).toContain(
      "view-transition-name:elder-tabbar",
    );
  });
});
