import { describe, expect, it } from "vitest";
import { html } from "../../../test/render";
import { AdminShell, collapseLabel, type AdminNavGroup } from "./AdminShell";

// Same shape and labels as the real menu; src/shared must not import from src/app.
const nav: AdminNavGroup[] = [
  { items: [{ href: "/admin", label: "ภาพรวม", icon: <i /> }] },
  {
    label: "ผู้ใช้และศูนย์",
    items: [
      { href: "/admin/users", label: "ผู้ใช้งาน", icon: <i /> },
      { href: "/admin/privacy", label: "คำขอข้อมูลส่วนบุคคล", icon: <i />, badge: "3" },
    ],
  },
  {
    label: "เนื้อหาและผล",
    items: [{ href: "/admin/content/courses", label: "คอร์สและแบบฝึก", icon: <i /> }],
  },
];

const shell = (extra: Partial<Parameters<typeof AdminShell>[0]> = {}) =>
  html(
    <AdminShell brand="Brain9" roleLabel="ผู้ดูแล" nav={nav} {...extra}>
      เนื้อหา
    </AdminShell>,
  );

describe("AdminShell", () => {
  it("renders the menu, groups, toggles and content with working links", () => {
    const out = shell();
    expect(out).toContain("<aside");
    expect(out).toContain('<nav aria-label="เมนูผู้ดูแล"');
    expect(out).toContain("<main");
    expect(out).toContain("คอร์สและแบบฝึก");
    expect(out).toContain("ผู้ใช้และศูนย์");
    expect(out).toContain("ย่อเมนู");
    expect(out).toContain('aria-label="เปิดหรือปิดเมนู"');
    expect(out).toContain('href="/admin/users"');
    expect(out).toContain("เนื้อหา");
    expect(out).not.toMatch(/type="search"/);
    expect(out).not.toContain("<h1");
  });

  it("gives every item an accessible name and title for the icon rail", () => {
    const out = shell();
    expect(out).toContain('aria-label="ผู้ใช้งาน"');
    expect(out).toContain('title="ผู้ใช้งาน"');
    expect(out).toContain('title="คอร์สและแบบฝึก"');
  });

  it("uses real buttons that report the menu state", () => {
    const out = shell();
    const buttons = out.match(/<button[^>]*>/g) ?? [];
    expect(buttons.length).toBe(2);
    for (const b of buttons) expect(b).toContain('type="button"');
    // Only the top-bar toggle reports a state; the bottom button names the action it does.
    const [bottom, top] = buttons;
    expect(bottom).not.toContain("aria-expanded");
    expect(bottom).toContain('aria-label="ย่อเมนู"');
    expect(bottom).toContain('title="ย่อเมนู"');
    expect(top).toContain('aria-expanded="true"');
    expect(top).toContain('aria-label="เปิดหรือปิดเมนู"');
  });

  it("tolerates a null pathname: no item is marked current", () => {
    expect(shell()).not.toContain("aria-current");
  });

  it("starts collapsed below 1024px through CSS, not through state", () => {
    const out = shell();
    expect(out).toContain('data-menu="auto"');
    expect(out).toContain("max-lg:");
  });

  it("renders the badge, the default footer, and the slots", () => {
    const out = shell({ user: <span>คุณตัวอย่าง</span>, centerSlot: <span>ศูนย์ตัวอย่าง</span> });
    expect(out).toContain(">3<");
    expect(out).toContain("Brain9 ระบบฝึกสมองผู้สูงอายุ");
    expect(out).toContain("คุณตัวอย่าง");
    expect(out).toContain("ศูนย์ตัวอย่าง");
    expect(out).toContain('data-ui="admin"');
  });

  it("shows the help link only when it has a destination", () => {
    expect(shell()).not.toContain("ช่วยเหลือ");
    expect(shell({ helpHref: "/help" })).toContain("ช่วยเหลือ");
  });

  it("lets the footer be replaced", () => {
    expect(shell({ footer: "ท้ายหน้าตัวอย่าง" })).toContain("ท้ายหน้าตัวอย่าง");
  });
});

describe("collapseLabel", () => {
  it("names the action the bottom button performs in each state", () => {
    expect(collapseLabel(true)).toBe("ย่อเมนู");
    expect(collapseLabel(false)).toBe("ขยายเมนู");
  });
});
