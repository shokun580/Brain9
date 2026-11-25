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
