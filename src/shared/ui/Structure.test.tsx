import { describe, expect, it } from "vitest";
import { html } from "../../../test/render";
import { Badge } from "./Badge";
import { ElderHeader } from "./ElderHeader";
import { ListRow } from "./ListRow";
import { Section } from "./Section";

describe("ElderHeader", () => {
  it("renders the back control as a button for a step kept in state", () => {
    const out = html(<ElderHeader title="สมัครสมาชิก" onBack={() => {}} />);
    expect(out).toMatch(/<button type="button"[^>]*>.*ย้อนกลับ<\/button>/);
    expect(out).not.toContain("<a ");
  });
  it("gives the button and the link the same look", () => {
    const classOf = (markup: string, tag: string) =>
      markup.match(new RegExp(`<${tag} [^>]*class="([^"]*)"`))?.[1];
    const link = html(<ElderHeader title="t" backHref="/home" />);
    const button = html(<ElderHeader title="t" onBack={() => {}} />);
    expect(classOf(button, "button")).toBe(classOf(link, "a"));
  });
  it("keeps the back control clear of the title under it", () => {
    const out = html(<ElderHeader title="t" backHref="/home" />);
    expect(out.match(/<a [^>]*class="([^"]*)"/)?.[1]).toContain("mb-3");
  });
  it("prefers the link when both are given, and shows no back control without either", () => {
    expect(html(<ElderHeader title="t" backHref="/home" onBack={() => {}} />)).toContain("<a ");
    expect(html(<ElderHeader title="t" />)).not.toContain("ย้อนกลับ");
  });
  it("shows a back link with its text label", () => {
    const out = html(<ElderHeader title="คอร์ส" backHref="/home" />);
    expect(out).toContain("ย้อนกลับ");
    expect(out).toMatch(/<a[^>]*href="\/home"/);
    expect(out).toContain("<svg");
    expect(out).toMatch(/<h1[^>]*>คอร์ส<\/h1>/);
  });
  it("renders the title as the page h1", () => {
    expect(html(<ElderHeader title="คอร์ส" />)).toMatch(/<h1[^>]*>คอร์ส<\/h1>/);
  });
  it("renders greeting and name, with the name as h1", () => {
    const out = html(<ElderHeader greeting="สวัสดีตอนเช้า" name="คุณตัวอย่าง" />);
    expect(out).toContain("สวัสดีตอนเช้า");
    expect(out).toMatch(/<h1[^>]*>คุณตัวอย่าง<\/h1>/);
  });
  it("lets the action wrap below the text instead of squeezing it", () => {
    const out = html(<ElderHeader greeting="สวัสดีตอนเช้า" name="คุณตัวอย่าง" action={<i />} />);
    expect(out).toMatch(/<header[^>]*class="[^"]*\bflex-wrap\b/);
    expect(out).toMatch(/<div class="[^"]*\bflex-1\b[^"]*\bbasis-40\b/);
    expect(out).toMatch(/<div class="shrink-0"><i><\/i><\/div>/);
  });
  it("uses a lone greeting as the only h1", () => {
    const out = html(<ElderHeader greeting="สวัสดีตอนเช้า" />);
    expect((out.match(/<h1/g) ?? []).length).toBe(1);
    expect(out).toMatch(/<h1[^>]*>สวัสดีตอนเช้า<\/h1>/);
    expect(out).not.toContain("<p");
  });
  it("renders the action slot and no back link by default", () => {
    const out = html(<ElderHeader title="t" action={<button>ก</button>} />);
    expect(out).toContain("<button>ก</button>");
    expect(out).not.toContain("ย้อนกลับ");
  });
});

describe("Section", () => {
  it("draws a thin top line that thickens in high contrast", () => {
    const out = html(<Section title="สัปดาห์นี้">x</Section>);
    expect(out).toContain("border-t");
    expect(out).toContain("border-t-[length:var(--b9-border)]");
    expect(out).toContain("border-line");
    expect(out).toContain("สัปดาห์นี้");
  });
  it("has no line when first", () => {
    expect(
      html(
        <Section first title="t">
          x
        </Section>,
      ),
    ).not.toContain("border-t");
  });
  it("renders eyebrow, title and action", () => {
    const out = html(
      <Section eyebrow="วันนี้" title="หัวข้อ" action={<a href="/x">ดูทั้งหมด</a>}>
        เนื้อหา
      </Section>,
    );
    expect(out).toContain("วันนี้");
    expect(out).toMatch(/<h2[^>]*>หัวข้อ<\/h2>/);
    expect(out).toContain("ดูทั้งหมด");
    expect(out).toContain("เนื้อหา");
  });
});

describe("Section header with an action", () => {
  it("wraps instead of squeezing the title", () => {
    const out = html(
      <Section title="หัวข้อ" action={<i />}>
        x
      </Section>,
    );
    expect(out).toMatch(/<div class="[^"]*\bflex-wrap\b/);
    expect(out).toMatch(/<div class="[^"]*\bmin-w-0\b[^"]*\bflex-1\b/);
    expect(out).toMatch(/<div class="shrink-0"><i><\/i><\/div>/);
  });
});

describe("ListRow", () => {
  const out = html(
    <ListRow href="/results" title="ผลลัพธ์ของฉัน" subtitle="ดูพัฒนาการ" badge={<Badge>ใหม่</Badge>} />,
  );
  it("is a link with title, subtitle and badge", () => {
    expect(out).toMatch(/<a[^>]*href="\/results"/);
    expect(out).toContain("ผลลัพธ์ของฉัน");
    expect(out).toContain("ดูพัฒนาการ");
    expect(out).toContain("ใหม่");
  });
  it("has a chevron, a large target and a line that thickens", () => {
    expect(out).toContain("<svg");
    expect(out).toContain("min-h-control");
    expect(out).toContain("border-b-[length:var(--b9-border)]");
    expect(out).toContain("border-line");
  });
});

describe("Badge", () => {
  it("always shows an icon for success and danger", () => {
    expect(html(<Badge tone="success">ทำครบแล้ว</Badge>)).toContain("<svg");
    expect(html(<Badge tone="danger">ผิด</Badge>)).toContain("<svg");
  });
  it("has no icon for the other tones", () => {
    for (const tone of ["neutral", "primary", "attention"] as const) {
      expect(html(<Badge tone={tone}>x</Badge>)).not.toContain("<svg");
    }
    expect(html(<Badge>ยังไม่เริ่ม</Badge>)).not.toContain("<svg");
  });
  it("is a pill with a border that only shows in high contrast", () => {
    const out = html(<Badge>x</Badge>);
    expect(out).toContain("rounded-full");
    expect(out).toContain("border-edge");
  });
  it("keeps text on soft backgrounds readable", () => {
    const out = html(<Badge tone="primary">x</Badge>);
    expect(out).toContain("bg-primary-soft");
    expect(out).toContain("text-primary-press");
    expect(out).not.toMatch(/text-primary(?!-)/);
  });
});
