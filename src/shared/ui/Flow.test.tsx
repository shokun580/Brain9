import { describe, expect, it } from "vitest";
import { html } from "../../../test/render";
import { ChoiceList } from "./ChoiceList";
import { Meter } from "./Meter";
import { PinPad } from "./PinPad";
import { ResultBanner } from "./ResultBanner";
import { stepLabel, StepProgress } from "./StepProgress";

describe("stepLabel", () => {
  it("clamps current into 1..total", () => {
    expect(stepLabel(2, 3)).toBe("ขั้นที่ 2 จาก 3");
    expect(stepLabel(9, 3)).toBe("ขั้นที่ 3 จาก 3");
    expect(stepLabel(0, 3)).toBe("ขั้นที่ 1 จาก 3");
  });
  it("is empty without a usable total", () => {
    expect(stepLabel(1, 0)).toBe("");
    expect(stepLabel(1, -2)).toBe("");
    expect(stepLabel(1, Number.NaN)).toBe("");
    expect(stepLabel(1, Number.POSITIVE_INFINITY)).toBe("");
    expect(stepLabel(1, 0.5)).toBe("");
  });
  it("floors fractions and tolerates a non-finite current", () => {
    expect(stepLabel(2.9, 3.7)).toBe("ขั้นที่ 2 จาก 3");
    expect(stepLabel(Number.NaN, 3)).toBe("");
  });
  it("renders nothing for an empty label", () => {
    expect(html(<StepProgress current={1} total={0} />)).toBe("");
    expect(html(<StepProgress current={2} total={3} />)).toContain("ขั้นที่ 2 จาก 3");
  });
});

/** The `<input>` tag of one option, so attribute order does not matter. */
function inputOf(markup: string, value: string): string {
  const tag = (markup.match(/<input[^>]*>/g) ?? []).find((t) => t.includes(`value="${value}"`));
  return tag ?? "";
}

describe("ChoiceList", () => {
  const options = [
    { value: "train", title: "โหมดฝึก" },
    { value: "test", title: "โหมดทดสอบ", description: "ยังไม่เปิดให้ใช้", disabled: true },
  ];
  it("is a fieldset with a legend and the default checked", () => {
    const c = html(
      <ChoiceList name="mode" legend="เลือกโหมด" defaultValue="train" options={options} />,
    );
    expect(c).toContain("<fieldset");
    expect(c).toContain("<legend");
    expect(c).toMatch(/<legend[^>]*text-lead/);
    expect(c).not.toMatch(/<legend[^>]*text-title/);
    expect(inputOf(c, "train")).toContain("checked");
    expect(inputOf(c, "test")).not.toContain("checked");
  });
  it("keeps radios reachable and explains a disabled option in words", () => {
    const c = html(<ChoiceList name="mode" legend="เลือกโหมด" options={options} />);
    expect(c).toContain("sr-only");
    expect(c).not.toContain('hidden"');
    expect(inputOf(c, "test")).toContain("disabled");
    expect(c).toContain("ยังไม่เปิดให้ใช้");
    expect(c).toContain("has-[:focus-visible]:outline-focus");
  });
});

describe("Meter", () => {
  it("exposes the value and the words", () => {
    const m = html(<Meter label="สัปดาห์นี้" value={3} max={5} valueText="ฝึกแล้ว 3 จาก 5 วัน" />);
    expect(m).toContain('role="meter"');
    expect(m).toContain('aria-valuenow="3"');
    expect(m).toContain("ฝึกแล้ว 3 จาก 5 วัน");
  });
  it("clamps a value above max", () => {
    const m = html(<Meter label="x" value={9} max={5} valueText="t" />);
    expect(m).toContain('aria-valuenow="5"');
    expect(m).toContain("width:100%");
  });
  it("does not divide by zero when max is 0", () => {
    const m = html(<Meter label="x" value={2} max={0} valueText="t" />);
    expect(m).toContain('aria-valuenow="0"');
    expect(m).toContain("width:0%");
    expect(m).not.toContain("NaN");
  });
  it("draws segments", () => {
    const m = html(<Meter label="x" value={2} max={5} valueText="t" segments />);
    expect((m.match(/bg-primary"/g) ?? []).length).toBe(2);
    expect((m.match(/bg-surface-muted/g) ?? []).length).toBe(3);
  });
});

describe("ResultBanner", () => {
  it("pairs icon and words for both tones", () => {
    const ok = html(<ResultBanner tone="success" title="ถูกต้อง เก่งมาก" />);
    expect(ok).toContain("<svg");
    expect(ok).toContain("ถูกต้อง เก่งมาก");
    expect(ok).toContain('role="status"');
    const bad = html(
      <ResultBanner tone="danger" title="ไม่เป็นไรนะ ลองอีกครั้ง" detail="ค่อย ๆ ทำได้เลย" />,
    );
    expect(bad).toContain("<svg");
    expect(bad).toContain('role="status"');
    expect(bad).toContain("ค่อย ๆ ทำได้เลย");
  });
});

describe("PinPad", () => {
  const pad = (filled: number, length: 4 | 6 = 4) =>
    html(<PinPad length={length} filled={filled} onDigit={() => {}} onDelete={() => {}} />);
  it("has 11 real buttons, the label and the delete word", () => {
    const p = pad(2);
    expect((p.match(/<button/g) ?? []).length).toBe(11);
    expect((p.match(/type="button"/g) ?? []).length).toBe(11);
    expect(p).toContain("ใส่แล้ว 2 จาก 4 หลัก");
    expect(p).toContain("ลบ");
    expect(p).toContain("min-h-control");
  });
  it("clamps filled into 0..length", () => {
    expect(pad(9)).toContain("ใส่แล้ว 4 จาก 4 หลัก");
    expect(pad(-1, 6)).toContain("ใส่แล้ว 0 จาก 6 หลัก");
    expect(pad(Number.NaN)).toContain("ใส่แล้ว 0 จาก 4 หลัก");
  });
  it("hides the empty slot from assistive tech", () => {
    expect(pad(0)).toContain('<span aria-hidden="true"></span>');
  });
});

describe("ChoiceList onValueChange", () => {
  const options = [
    { value: "a", title: "ตัวเลือก ก" },
    { value: "b", title: "ตัวเลือก ข" },
  ];
  it("accepts the prop and leaves the markup unchanged", () => {
    const without = html(<ChoiceList name="x" legend="เลือก" options={options} defaultValue="a" />);
    const withProp = html(
      <ChoiceList
        name="x"
        legend="เลือก"
        options={options}
        defaultValue="a"
        onValueChange={() => {}}
      />,
    );
    expect(withProp).toBe(without);
  });
});

describe("Meter and StepProgress stay visible in high contrast", () => {
  it("gives the continuous track an edge", () => {
    const m = html(<Meter label="x" value={2} max={5} valueText="t" />);
    expect(m).toMatch(/class="[^"]*\bborder-edge\b[^"]*\bbg-surface-muted/);
  });
  it("gives every unlit block an edge and lit blocks the same border width", () => {
    const m = html(<Meter label="x" value={2} max={5} valueText="t" segments />);
    const blocks = m.match(/<span class="[^"]*"><\/span>/g) ?? [];
    expect(blocks.length).toBe(5);
    for (const block of blocks) expect(block).toMatch(/\bborder\b/);
    expect(
      blocks.filter((b) => b.includes("bg-surface-muted") && b.includes("border-edge")).length,
    ).toBe(3);
  });
  it("gives unfilled step bars an edge", () => {
    const s = html(<StepProgress current={1} total={3} />);
    const bars = s.match(/<span class="[^"]*"><\/span>/g) ?? [];
    expect(bars.length).toBe(3);
    for (const bar of bars) expect(bar).toMatch(/\bborder\b/);
    expect(
      bars.filter((b) => b.includes("bg-surface-muted") && b.includes("border-edge")).length,
    ).toBe(2);
  });
});

describe("ChoiceList hint, errors and required", () => {
  const options = [
    { value: "a", title: "ก" },
    { value: "b", title: "ข" },
  ];
  const base = html(<ChoiceList name="mode" legend="เลือก" options={options} />);
  it("shows errors as an alert with a cross and wires the fieldset", () => {
    const c = html(
      <ChoiceList name="mode" legend="เลือก" options={options} errors={["กรุณาเลือก"]} />,
    );
    expect(c).toMatch(/<p[^>]*role="alert"[^>]*>✕ (<!-- -->)?กรุณาเลือก/);
    const fieldset = c.match(/<fieldset[^>]*>/)?.[0] ?? "";
    expect(fieldset).toContain('aria-invalid="true"');
    expect(fieldset).toContain('aria-describedby="field-mode-error"');
    expect(c).toContain('id="field-mode-error"');
  });
  it("shows the hint without errors and hides it with them", () => {
    const withHint = html(
      <ChoiceList name="mode" legend="เลือก" options={options} hint="เลือกได้หนึ่งข้อ" />,
    );
    expect(withHint).toContain("เลือกได้หนึ่งข้อ");
    expect(withHint).toMatch(/<fieldset[^>]*aria-describedby="field-mode-hint"/);
    expect(withHint).not.toContain("aria-invalid");
    const both = html(
      <ChoiceList name="mode" legend="เลือก" options={options} hint="เลือกได้หนึ่งข้อ" errors={["ผิด"]} />,
    );
    expect(both).not.toContain("เลือกได้หนึ่งข้อ");
    expect(both).not.toContain("field-mode-hint");
  });
  it("passes required to every radio", () => {
    const c = html(<ChoiceList name="mode" legend="เลือก" options={options} required />);
    expect(inputOf(c, "a")).toContain("required");
    expect(inputOf(c, "b")).toContain("required");
    expect(inputOf(base, "a")).not.toContain("required");
  });
  it("renders no messages wrapper without a hint or errors", () => {
    expect(base).not.toContain("aria-describedby");
    expect(base).not.toContain("aria-invalid");
    expect(base).not.toContain('role="alert"');
    expect(base).not.toContain("-hint");
    expect(base).not.toContain("mt-2");
    expect(html(<ChoiceList name="mode" legend="เลือก" options={options} errors={[]} />)).toBe(base);
  });
  it("renders the messages wrapper when there is a hint or an error", () => {
    const withHint = html(<ChoiceList name="mode" legend="เลือก" options={options} hint="ช่วย" />);
    const withError = html(
      <ChoiceList name="mode" legend="เลือก" options={options} errors={["ผิด"]} />,
    );
    expect(withHint).toContain("mt-2");
    expect(withError).toContain("mt-2");
  });
});

describe("PinPad keys and announcements", () => {
  const pad = (props: { disabled?: boolean } = {}) =>
    html(<PinPad length={4} filled={2} onDigit={() => {}} onDelete={() => {}} {...props} />);
  const buttonOf = (markup: string, text: string) =>
    (markup.match(/<button[^>]*>[\s\S]*?<\/button>/g) ?? []).find(
      (b) => b.includes(`>${text}<`) || b.endsWith(`${text}</button>`),
    ) ?? "";
  it("sets the font size per key", () => {
    const p = pad();
    const del = buttonOf(p, "ลบ");
    expect(del).toContain("text-body");
    expect(del).not.toContain("text-title");
    expect(buttonOf(p, "5")).toContain("text-title");
  });
  it("announces progress politely and never the digits", () => {
    const live = pad().match(/<[^>]*aria-live="polite"[^>]*>[^<]*<\/[a-z]+>/)?.[0] ?? "";
    expect(live).toContain("sr-only");
    expect(live).toContain("ใส่แล้ว 2 จาก 4 หลัก");
  });
  it("disables every key and mutes the pad", () => {
    const p = pad({ disabled: true });
    const buttons = p.match(/<button[^>]*>/g) ?? [];
    expect(buttons.length).toBe(11);
    for (const b of buttons) expect(b).toMatch(/ disabled=""/);
    expect(p).toContain("disabled:opacity-60");
    expect((pad().match(/<button[^>]* disabled=""/g) ?? []).length).toBe(0);
  });
});

describe("ResultBanner heading", () => {
  it("is a paragraph by default and a heading on request", () => {
    expect(html(<ResultBanner tone="success" title="เก่งมาก" />)).not.toMatch(/<h[1-3]/);
    expect(html(<ResultBanner tone="success" title="เก่งมาก" headingLevel={1} />)).toMatch(
      /<h1[^>]*>เก่งมาก<\/h1>/,
    );
  });
});
