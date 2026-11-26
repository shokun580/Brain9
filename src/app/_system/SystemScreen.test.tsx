import { describe, expect, it } from "vitest";
import { html } from "../../../test/render";
import { SystemScreen } from "./SystemScreen";

const base = {
  title: "ยังหาหน้านี้ไม่เจอ",
  description: "ไม่เป็นไรนะ ลองอีกครั้ง",
  action: <button type="button">กลับหน้าหลัก</button>,
};

describe("SystemScreen", () => {
  it("renders exactly one h1 carrying the title", () => {
    const out = html(<SystemScreen {...base} />);
    expect(out.match(/<h1\b/g)).toHaveLength(1);
    expect(out).toMatch(/<h1[^>]*>ยังหาหน้านี้ไม่เจอ<\/h1>/);
  });

  it("always shows the fixed help line", () => {
    expect(html(<SystemScreen {...base} />)).toContain("ต้องการความช่วยเหลือ แจ้งเจ้าหน้าที่ศูนย์ได้เลย");
  });

  it("shows the reference only when given", () => {
    expect(html(<SystemScreen {...base} />)).not.toContain("รหัสอ้างอิง");
    expect(html(<SystemScreen {...base} reference="รหัสอ้างอิง 1a2b3c" />)).toContain(
      "รหัสอ้างอิง 1a2b3c",
    );
  });

  it("renders the secondary action when given", () => {
    const out = html(
      <SystemScreen {...base} secondaryAction={<button type="button">ทางเลือก</button>} />,
    );
    expect(out).toContain("ทางเลือก");
  });

  it("fills the viewport unless embedded", () => {
    expect(html(<SystemScreen {...base} />)).toContain("min-h-dvh");
    expect(html(<SystemScreen {...base} embedded />)).not.toContain("min-h-dvh");
  });

  it("carries the elderly scope", () => {
    expect(html(<SystemScreen {...base} />)).toContain('data-ui="elder"');
  });
});
