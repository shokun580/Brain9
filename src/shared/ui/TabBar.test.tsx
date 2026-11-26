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

  it("shows the current tab as a soft block, with more than colour: the block itself", () => {
    const t = html(<TabBarView items={items} pathname="/home" />);
    const current = t.match(/<a aria-current="page"[^>]*>/)?.[0] ?? "";
    const other = t.match(/<a (?!aria-current)[^>]*href="\/courses"[^>]*>/)?.[0] ?? "";
    expect(current).toContain("bg-primary-soft");
    expect(current).toContain("text-primary-press");
    expect(other).not.toContain("bg-primary-soft");
    expect(other).toContain("text-fg-2");
  });

  it("is a floating bar: rounded, bordered and raised, inside a strip that keeps its own height", () => {
    const t = html(<TabBarView items={items} pathname="/home" />);
    const nav = t.match(/<nav[^>]*>/)?.[0] ?? "";
    expect(nav).toContain("sticky");
    expect(nav).toContain("bottom-0");
    expect(t).toMatch(/<div[^>]*class="[^"]*rounded-panel[^"]*shadow-dock/);
    expect(t).toMatch(/<div[^>]*class="[^"]*border-line-strong/);
  });

  it("leaves the strip around the bar see-through and lets taps reach the page behind it", () => {
    const t = html(<TabBarView items={items} pathname="/home" />);
    const nav = t.match(/<nav[^>]*>/)?.[0] ?? "";
    expect(nav).not.toMatch(/\bbg-/);
    expect(nav).toContain("pointer-events-none");
    expect(t).toMatch(/<div[^>]*class="[^"]*pointer-events-auto[^"]*bg-surface/);
  });

  it("keeps every tab a 48px target", () => {
    const t = html(<TabBarView items={items} pathname="/home" />);
    for (const link of t.match(/<a [^>]*>/g) ?? []) expect(link).toContain("min-h-12");
  });

  it("names the bar so it stays put during a page transition", () => {
    expect(html(<TabBarView items={items} pathname="/home" />)).toContain(
      "view-transition-name:elder-tabbar",
    );
  });
});
