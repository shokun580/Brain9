import { describe, expect, it } from "vitest";
import { html } from "../../../test/render";
import { AdminNavView, AdminShell, collapseLabel } from "./AdminShell";
import type { AdminNavSection } from "./admin-nav";

// Same shape and labels as the real menu; src/shared must not import from src/app.
const sections: AdminNavSection[] = [
  {
    id: "overview",
    label: "ภาพรวม",
    railLabel: "ภาพรวม",
    icon: <i />,
    groups: [{ items: [{ href: "/admin", label: "ภาพรวม", icon: <i /> }] }],
  },
  {
    id: "people",
    label: "ผู้ใช้และศูนย์",
    railLabel: "ผู้ใช้",
    icon: <i />,
    groups: [
      {
        label: "ผู้ใช้",
        items: [
          { href: "/admin/users", label: "ผู้ใช้งาน", icon: <i /> },
          { href: "/admin/privacy", label: "คำขอข้อมูลส่วนบุคคล", icon: <i />, badge: "3" },
        ],
      },
      { label: "ศูนย์", items: [{ href: "/admin/centers", label: "ศูนย์และเครื่อง", icon: <i /> }] },
    ],
  },
  {
    id: "content",
    label: "เนื้อหาและผล",
    railLabel: "เนื้อหา",
    icon: <i />,
    groups: [
      {
        label: "เนื้อหา",
        items: [{ href: "/admin/content/courses", label: "คอร์สและแบบฝึก", icon: <i /> }],
      },
    ],
  },
];

const shell = (extra: Partial<Parameters<typeof AdminShell>[0]> = {}) =>
  html(
    <AdminShell brand="Brain9" roleLabel="ผู้ดูแล" nav={sections} {...extra}>
      เนื้อหาตัวอย่าง
    </AdminShell>,
  );

const view = (pathname: string | null) =>
  html(<AdminNavView sections={sections} pathname={pathname} />);

const navs = (markup: string) => markup.match(/<nav[\s\S]*?<\/nav>/g) ?? [];
const links = (markup: string) => markup.match(/<a [^>]*>/g) ?? [];

describe("AdminNavView", () => {
  it("renders the rail and the panel as two labelled landmarks", () => {
    const out = view("/admin/users");
    const [rail, panel] = navs(out);
    expect(navs(out)).toHaveLength(2);
    expect(rail).toContain('aria-label="หมวดเมนูผู้ดูแล"');
    expect(rail).toContain("bg-nav-rail");
    expect(panel).toContain('id="admin-panel"');
    expect(panel).toContain('aria-labelledby="admin-panel-title"');
    expect(panel).toContain('id="admin-panel-title"');
    expect(panel).toContain("bg-ink");
  });

  it("points each section link at its first page and shows the rail word", () => {
    const [rail = ""] = navs(view("/admin/users"));
    expect(rail).toContain('href="/admin/users"');
    expect(rail).toContain('href="/admin/content/courses"');
    expect(rail).toContain('title="ผู้ใช้และศูนย์"');
    expect(rail).toContain(">ผู้ใช้<");
    expect(rail).toContain(">เนื้อหา<");
  });

  it("marks the current section and the current page, nothing else", () => {
    const out = view("/admin/privacy");
    const [rail = "", panel = ""] = navs(out);
    const railCurrent = links(rail).filter((a) => a.includes("aria-current"));
    expect(railCurrent).toHaveLength(1);
    expect(railCurrent[0]).toContain('href="/admin/users"');
    expect(railCurrent[0]).toContain('aria-current="true"');
    expect(railCurrent[0]).toContain("bg-nav-fill");
    const panelCurrent = links(panel).filter((a) => a.includes("aria-current"));
    expect(panelCurrent).toHaveLength(1);
    expect(panelCurrent[0]).toContain('href="/admin/privacy"');
    expect(panelCurrent[0]).toContain('aria-current="page"');
    expect(panelCurrent[0]).toContain("bg-nav-fill");
    expect(panelCurrent[0]).toContain("text-on-ink");
  });

  it("uses aria-current=page on the rail link when the section's first page is open", () => {
    const [rail = ""] = navs(view("/admin/users"));
    const current = links(rail).filter((a) => a.includes("aria-current"));
    expect(current[0]).toContain('aria-current="page"');
  });

  it("lists only the pages of the current section in the panel", () => {
    const [, panel = ""] = navs(view("/admin/content/courses/abc"));
    expect(panel).toContain("เนื้อหาและผล");
    expect(panel).toContain("คอร์สและแบบฝึก");
    expect(panel).not.toContain("ผู้ใช้งาน");
  });

  it("keeps the two navs free of shadows, bold text and an accent bar", () => {
    for (const path of ["/admin/users", null]) {
      for (const nav of navs(view(path))) {
        expect(nav).not.toMatch(/shadow/);
        expect(nav).not.toMatch(/font-bold/);
        expect(nav).not.toMatch(/before:/);
      }
    }
  });

  it("stacks every section when the pathname is unknown", () => {
    for (const path of [null, "/somewhere-else"]) {
      const out = view(path);
      for (const label of ["ภาพรวม", "ผู้ใช้และศูนย์", "เนื้อหาและผล"]) expect(out).toContain(label);
      for (const label of ["ผู้ใช้งาน", "คำขอข้อมูลส่วนบุคคล", "ศูนย์และเครื่อง", "คอร์สและแบบฝึก"]) {
        expect(out).toContain(label);
      }
      expect(out).not.toContain("aria-current");
    }
  });

  it("renders a group label for screen readers only, with a rule between groups", () => {
    const [, panel = ""] = navs(view("/admin/users"));
    expect(panel).toMatch(/<p class="sr-only">ศูนย์<\/p>/);
    expect(panel).toContain("border-nav-line");
  });

  it("announces the badge", () => {
    const [, panel = ""] = navs(view("/admin/users"));
    expect(panel).toContain("3");
    expect(panel).toMatch(/sr-only[^>]*>[^<]+<\/span>3/);
  });
});

describe("AdminShell", () => {
  it("renders the frame, the skip link, the main landmark and no heading", () => {
    const out = shell();
    expect(navs(out)).toHaveLength(2);
    expect(out).toContain('href="#main"');
    expect(out).toContain("ข้ามไปยังเนื้อหา");
    expect(out).toMatch(/<main[^>]*id="main"/);
    expect(out).toContain("max-w-admin");
    expect(out).toContain("เนื้อหาตัวอย่าง");
    expect(out).toContain('data-ui="admin"');
    expect(out).not.toContain("<h1");
    expect(out).not.toMatch(/type="search"/);
  });

  it("hides the panel through CSS below 1024px and lets noscript force it open", () => {
    const out = shell();
    expect(out).toContain('data-panel="auto"');
    const [, panel = ""] = navs(out);
    expect(panel).toContain("invisible");
    expect(panel).toContain("w-0");
    expect(panel).toContain("max-lg:");
    expect(panel).toContain("noscript:");
  });

  it("renders every page as a working link before hydration and marks none current", () => {
    const out = shell();
    expect(out).toContain('href="/admin/centers"');
    expect(out).toContain("ศูนย์และเครื่อง");
    expect(out).not.toContain("aria-current");
  });

  it("uses real buttons: the rail foot names its action, the top bar reports its state", () => {
    const out = shell();
    const buttons = out.match(/<button[^>]*>/g) ?? [];
    expect(buttons).toHaveLength(2);
    for (const b of buttons) expect(b).toContain('type="button"');
    const top = buttons.find((b) => b.includes("aria-expanded")) ?? "";
    expect(top).toContain('aria-controls="admin-panel"');
    expect(top).toContain('aria-expanded="true"');
    const foot = buttons.find((b) => !b.includes("aria-expanded")) ?? "";
    expect(foot).toContain('aria-label="ย่อเมนู"');
  });

  it("names only the top bar for view transitions (a named menu cannot be clicked mid-transition)", () => {
    const out = shell();
    expect(out).not.toContain("view-transition-name:admin-nav");
    expect(out).toContain("view-transition-name:admin-topbar");
  });

  it("shows the brand mark in the rail head", () => {
    const out = shell();
    expect(out).toContain("<svg");
    expect(out).toContain('viewBox="0 0 64 64"');
  });

  it("renders the default footer, the environment label and the slots", () => {
    const out = shell({
      user: <span>คุณตัวอย่าง</span>,
      centerSlot: <span>ศูนย์ตัวอย่าง</span>,
      environmentLabel: "staging",
    });
    expect(out).toContain("Brain9 ระบบฝึกสมองผู้สูงอายุ");
    expect(out).toContain("staging");
    expect(out).toContain("คุณตัวอย่าง");
    expect(out).toContain("ศูนย์ตัวอย่าง");
    expect(shell()).not.toContain("staging");
  });

  it("shows the help link only when it has a destination", () => {
    expect(shell()).not.toContain("ช่วยเหลือ");
    expect(shell({ helpHref: "/help" })).toContain("ช่วยเหลือ");
  });

  it("lets the footer be replaced", () => {
    expect(shell({ footer: "ท้ายหน้าตัวอย่าง" })).toContain("ท้ายหน้าตัวอย่าง");
  });
});

describe("AdminShell content column", () => {
  it("is at most max-w-admin wide and left aligned", () => {
    const out = shell();
    expect(out).toContain('class="max-w-admin"');
    expect(out).not.toContain("mx-auto");
  });
});

describe("collapseLabel", () => {
  it("names the action the rail-foot button performs in each state", () => {
    expect(collapseLabel(true)).toBe("ย่อเมนู");
    expect(collapseLabel(false)).toBe("ขยายเมนู");
  });
});
