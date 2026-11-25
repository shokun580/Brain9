import { describe, expect, it } from "vitest";
import { html } from "../../../test/render";
import { ComingSoon } from "./ComingSoon";
import { ConfirmDialog } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";
import { Notice } from "./Notice";
import { Toast } from "./Toast";

describe("Notice", () => {
  it("always renders an icon", () => {
    for (const tone of ["primary", "success", "danger", "attention"] as const) {
      expect(html(<Notice tone={tone}>x</Notice>)).toContain("<svg");
    }
  });
  it("announces danger as an alert and the rest as status", () => {
    expect(html(<Notice tone="danger">ผิดพลาด</Notice>)).toContain('role="alert"');
    expect(html(<Notice tone="primary">x</Notice>)).toContain('role="status"');
    expect(html(<Notice tone="success">x</Notice>)).toContain('role="status"');
  });
  it("sizes the icon from the scope token", () => {
    expect(html(<Notice tone="success">x</Notice>)).toContain("size-icon");
  });
  it("shows the optional title", () => {
    expect(
      html(
        <Notice tone="attention" title="โปรดทราบ">
          x
        </Notice>,
      ),
    ).toContain("โปรดทราบ");
  });
});

describe("ConfirmDialog", () => {
  const dialog = html(
    <ConfirmDialog
      open
      title="ระงับบัญชี?"
      confirmLabel="ระงับบัญชี"
      tone="danger"
      onConfirm={() => {}}
      onCancel={() => {}}
    >
      ผลที่จะเกิด
    </ConfirmDialog>,
  );
  it("renders a native dialog with title and consequences", () => {
    expect(dialog).toContain("<dialog");
    expect(dialog).toContain("ระงับบัญชี?");
    expect(dialog).toContain("ผลที่จะเกิด");
  });
  it("puts the cancel button before the confirm button", () => {
    expect(dialog.indexOf("ยกเลิก")).toBeLessThan(dialog.lastIndexOf("ระงับบัญชี"));
  });
  it("styles a danger confirm button", () => {
    expect(dialog).toContain("bg-danger");
  });
  it("has a visible edge and a backdrop without custom properties", () => {
    expect(dialog).toContain("border-edge");
    expect(dialog).toContain("backdrop:bg-black/50");
  });
  it("gives each dialog its own title id", () => {
    const two = html(
      <>
        <ConfirmDialog open title="หนึ่ง" confirmLabel="a" onConfirm={() => {}} onCancel={() => {}}>
          x
        </ConfirmDialog>
        <ConfirmDialog open title="สอง" confirmLabel="b" onConfirm={() => {}} onCancel={() => {}}>
          y
        </ConfirmDialog>
      </>,
    );
    const labels = [...two.matchAll(/aria-labelledby="([^"]+)"/g)].map((m) => m[1]);
    const ids = [...two.matchAll(/<h2 id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
    expect(labels).toEqual(ids);
  });
  it("uses a custom cancel label", () => {
    const d = html(
      <ConfirmDialog
        open
        title="t"
        confirmLabel="ตกลง"
        cancelLabel="กลับ"
        onConfirm={() => {}}
        onCancel={() => {}}
      >
        x
      </ConfirmDialog>,
    );
    expect(d).toContain("กลับ");
    expect(d).not.toContain("ยกเลิก");
  });
});

describe("Toast", () => {
  it("is a status message", () => {
    expect(html(<Toast message="บันทึกแล้ว" />)).toContain('role="status"');
  });
  it("has a visible edge and no soft text colour", () => {
    for (const tone of ["success", "danger"] as const) {
      const out = html(<Toast message="x" tone={tone} />);
      expect(out).toContain("border-edge");
      expect(out).not.toMatch(/text-[a-z]+-soft/);
      expect(out).toContain("text-white");
    }
  });
  it("renders the danger tone with an icon and the message", () => {
    const out = html(<Toast message="ไม่สำเร็จ" tone="danger" />);
    expect(out).toContain('role="status"');
    expect(out).toContain("<svg");
    expect(out).toContain("ไม่สำเร็จ");
  });
});

describe("EmptyState", () => {
  it("shows title, description and action", () => {
    const out = html(
      <EmptyState title="ยังไม่มีคอร์ส" description="เริ่มสร้าง" action={<a href="/x">สร้าง</a>} />,
    );
    expect(out).toContain("ยังไม่มีคอร์ส");
    expect(out).toContain("เริ่มสร้าง");
    expect(out).toContain("สร้าง</a>");
  });
});

describe("ComingSoon", () => {
  it("keeps title and owner", () => {
    const out = html(<ComingSoon title="คอร์ส" owner="content" />);
    expect(out).toContain("คอร์ส");
    expect(out).toContain("content");
  });
});
