import { describe, expect, it } from "vitest";
import { html } from "../../../test/render";
import { PageHeader } from "./PageHeader";
import { SaveBar } from "./SaveBar";
import { SegmentedControl } from "./SegmentedControl";
import { StatTile } from "./StatTile";

describe("PageHeader", () => {
  const out = html(
    <PageHeader
      title="ผู้ใช้งาน"
      description="รายชื่อผู้ใช้ตัวอย่าง"
      action={<a href="/new">เพิ่ม</a>}
      breadcrumbs={[{ label: "ผู้ใช้และศูนย์", href: "/admin/users" }, { label: "ผู้ใช้งาน" }]}
    />,
  );
  it("has an h1 and a labelled breadcrumb", () => {
    expect(out).toMatch(/<h1[^>]*text-title font-bold[^>]*>ผู้ใช้งาน<\/h1>/);
    expect(out).toContain('aria-label="เส้นทาง"');
  });
  it("links earlier crumbs and marks the last as the current page", () => {
    expect(out).toMatch(/<a [^>]*href="\/admin\/users"[^>]*>ผู้ใช้และศูนย์<\/a>/);
    expect(out).toMatch(/<span[^>]*text-fg[^>]*aria-current="page"[^>]*>ผู้ใช้งาน<\/span>/);
    expect(out).not.toMatch(/<span[^>]*font-bold[^>]*aria-current="page"/);
    expect(out).toMatch(/aria-hidden="true"[^>]*>\//);
  });
  it("keeps the action from squeezing the title", () => {
    expect(out).toContain("flex-wrap");
    expect(out).toContain("min-w-0 flex-1");
    expect(out).toContain("shrink-0");
    expect(out).toMatch(/text-fg-muted[^>]*>รายชื่อผู้ใช้ตัวอย่าง</);
  });
  it("renders without breadcrumbs, description or action", () => {
    const bare = html(<PageHeader title="x" />);
    expect(bare).not.toContain("<nav");
    expect(bare).toContain("<h1");
  });
});

describe("StatTile", () => {
  it("shows the value in tabular numbers with its unit", () => {
    const out = html(<StatTile icon={<i />} label="ผู้ฝึก" value="42" unit="คน" />);
    expect(out).toContain("tabular-nums");
    expect(out).toContain("text-title font-bold");
    expect(out).toMatch(/text-small text-fg-muted[^>]*>คน</);
    expect(out).toContain("size-11");
    expect(out).toContain("bg-primary-soft text-primary-press");
  });
  it("pairs every delta with a marker so colour is never the only cue", () => {
    const up = html(
      <StatTile icon={<i />} label="a" value="1" delta={{ text: "เพิ่มขึ้น 5", tone: "up" }} />,
    );
    expect(up).toContain("เพิ่มขึ้น 5");
    expect(up).toContain("text-success");
    expect(up).toContain("<svg");
    const flat = html(
      <StatTile icon={<i />} label="a" value="1" delta={{ text: "เท่าเดิม", tone: "flat" }} />,
    );
    expect(flat).toContain("text-fg-muted");
    expect(flat).toContain("<svg");
  });
  it("switches to attention tones on a warning delta", () => {
    const out = html(
      <StatTile icon={<i />} label="a" value="1" delta={{ text: "ต้องดู", tone: "warn" }} />,
    );
    expect(out).toContain("bg-attention-soft text-attention");
    expect(out).not.toContain("bg-primary-soft");
    expect(out).toContain("<svg");
  });
  it("has no delta line without a delta", () => {
    expect(html(<StatTile icon={<i />} label="a" value="1" />)).not.toContain("<svg");
  });
});

describe("SegmentedControl", () => {
  const options = [
    { value: "one", label: "ทีละช่อง" },
    { value: "duo", label: "สองนิ้วพร้อมกัน", icon: <b data-i="1" /> },
  ];
  const out = html(
    <SegmentedControl name="m" legend="วิธีกด" defaultValue="one" options={options} />,
  );
  it("is a fieldset of native radios with a visually hidden legend", () => {
    expect(out).toContain("<fieldset");
    expect(out).toMatch(/<legend[^>]*sr-only[^>]*>วิธีกด<\/legend>/);
    expect(out.match(/type="radio"/g)).toHaveLength(2);
  });
  it("checks only the default option", () => {
    const inputs = out.match(/<input[^>]*>/g) ?? [];
    const checked = inputs.filter((tag) => tag.includes("checked"));
    expect(checked).toHaveLength(1);
    expect(checked[0]).toContain('value="one"');
  });
  it("styles the selected segment and shows the focus ring on the segment", () => {
    expect(out).toContain("has-[:checked]:bg-ink");
    expect(out).toContain("has-[:checked]:text-on-ink");
    expect(out).toContain("has-[:checked]:font-bold");
    expect(out).toContain("bg-surface text-fg");
    expect(out).toContain("has-[:focus-visible]:outline-3");
    expect(out).toContain("has-[:focus-visible]:outline-offset-2");
    expect(out).toContain("has-[:focus-visible]:outline-focus");
    expect(out).toContain("min-h-control");
    expect(out).toContain("border-line-strong");
    expect(out).toContain("rounded-control");
  });
  it("does not clip the focus ring of any segment", () => {
    const wrapper = out.match(/<div class="([^"]*)"/)?.[1] ?? "";
    expect(wrapper).not.toContain("overflow-hidden");
    const labels = (out.match(/<label class="[^"]*"/g) ?? []).map((l) => l);
    expect(labels).toHaveLength(2);
    for (const label of labels) {
      expect(label).toMatch(/\brelative\b/);
      expect(label).toContain("has-[:focus-visible]:z-10");
      expect(label).toContain("first:rounded-l-control");
      expect(label).toContain("last:rounded-r-control");
    }
  });
  it("hides option icons from assistive technology", () => {
    expect(out).toMatch(/aria-hidden="true"[^>]*><b data-i="1"/);
  });
});

describe("SaveBar", () => {
  it("announces unsaved changes in a status region that is always mounted", () => {
    const dirty = html(<SaveBar dirty>x</SaveBar>);
    expect(dirty).toContain("มีการแก้ไขที่ยังไม่บันทึก");
    expect(dirty).toContain('role="status"');
    expect(dirty).toContain("sticky bottom-0");
    expect(dirty).toContain("border-line");
    const clean = html(<SaveBar dirty={false}>x</SaveBar>);
    expect(clean).not.toContain("มีการแก้ไขที่ยังไม่บันทึก");
    expect(clean).toContain('role="status"');
  });
  it("keeps the buttons at the end and the dot decorative", () => {
    const out = html(<SaveBar dirty>ปุ่ม</SaveBar>);
    expect(out).toMatch(/aria-hidden="true"[^>]*bg-attention/);
    expect(out).toContain("flex-wrap");
    expect(out).toContain("ปุ่ม");
  });
});
