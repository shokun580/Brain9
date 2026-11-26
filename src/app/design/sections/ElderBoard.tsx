import type { ReactNode } from "react";
import { CalendarDays, ChartNoAxesColumn, Play, UserRound } from "lucide-react";
import {
  Badge,
  Button,
  ChoiceList,
  ElderHeader,
  ListRow,
  Meter,
  Notice,
  Section,
} from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { ElderScope, SubHeading } from "../chrome";
import { Example } from "../Example";

export type CellState = "empty" | "shown" | "lit" | "tapped" | "correct" | "wrong";

const cellStyle: Record<CellState, string> = {
  empty: "bg-surface shadow-cell",
  shown: "bg-primary-tint",
  lit: "bg-primary shadow-cell-lit",
  tapped: "bg-primary text-on-primary",
  correct: "bg-success text-on-primary",
  wrong: "bg-danger text-on-danger",
};

/** A static picture of one cell: 20px radius, white or filled, the glyph says it without colour. */
export function Cell({ state, children }: { state: CellState; children?: ReactNode }) {
  return (
    <span
      className={cn(
        "flex aspect-square items-center justify-center rounded-[20px] border-[length:var(--b9-border)] border-edge text-title font-bold",
        cellStyle[state],
      )}
    >
      {children}
    </span>
  );
}

const legend: { state: CellState; word: string; token: string; glyph?: string }[] = [
  { state: "empty", word: "ว่าง", token: "surface + shadow-cell" },
  { state: "shown", word: "แสดงลำดับ", token: "primary-tint" },
  { state: "lit", word: "สว่าง", token: "primary + shadow-cell-lit" },
  { state: "tapped", word: "แตะแล้ว", token: "primary + เลขลำดับ", glyph: "2" },
  { state: "correct", word: "ถูก", token: "success + ✓", glyph: "✓" },
  { state: "wrong", word: "ยังไม่ถูก", token: "danger + ✕", glyph: "✕" },
];

const iconProp = {
  "aria-hidden": true,
  className: "size-icon text-primary-press",
} as const;

export function ElderBoard() {
  return (
    <>
      <SubHeading>กระดาน 3x3 (ตัวอย่างอ้างอิงสำหรับทีม engine)</SubHeading>

      <Example
        title="กระดานเล่น"
        importLine='import { Notice } from "@/shared/ui";'
        note="ภาพนิ่งจาก div ไม่ใช่ตัว PatternGrid (ของ engine) พื้น primary-soft มุม 26 พิกเซล ขอบใน 14 ช่องไฟ 12 เป็นสี่เหลี่ยมจัตุรัส ช่องมุม 20 พิกเซลและไม่ขยับหรือเปลี่ยนขนาดขณะแตะ"
      >
        <ElderScope>
          <div className="grid grid-cols-3 gap-x-4 gap-y-5">
            {legend.map((item) => (
              <div key={item.state} className="flex flex-col gap-1">
                <Cell state={item.state}>{item.glyph}</Cell>
                <p className="text-small font-bold text-fg">{item.word}</p>
                <p className="text-small text-fg-muted">{item.token}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex max-w-xs flex-col gap-3">
            <Notice tone="attention">ช่องนี้ต้องแตะสองนิ้วพร้อมกัน</Notice>
            <div
              role="img"
              aria-label="ตัวอย่างกระดาน: ช่องที่ 1 และ 2 แตะแล้ว ช่องที่ 3 สว่าง ช่องที่ 5 แสดงลำดับ ที่เหลือว่าง"
              className="grid aspect-square grid-cols-3 gap-3 rounded-panel bg-primary-soft p-3.5"
            >
              <Cell state="tapped">1</Cell>
              <Cell state="tapped">2</Cell>
              <Cell state="lit" />
              <Cell state="empty" />
              <Cell state="shown" />
              <Cell state="empty" />
              <Cell state="empty" />
              <Cell state="empty" />
              <Cell state="empty" />
            </div>
          </div>
        </ElderScope>
      </Example>

      <Example
        title="โหมดสีตัดกันสูง"
        importLine='import { Badge, Button, ChoiceList, Meter, Notice } from "@/shared/ui";'
        note="ค่าสีของโหมดนี้ผูกกับ html[data-contrast='high'] ที่ฝั่งผู้สูงอายุเท่านั้น จึงจำลองในกรอบเล็ก ๆ ไม่ได้ ให้กดปุ่ม “ก ขนาดตัวอักษร” ในตัวอย่าง ElderHeader ด้านบนเพื่อเปิดโหมดนี้ ตัวอย่างทั้งหมดในหน้านี้ รวมถึงชุดด้านล่าง จะเปลี่ยนไป ปิดได้จากปุ่มเดิม"
      >
        <ElderScope>
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-3">
              <Button>เริ่มฝึก</Button>
              <Button variant="secondary">ดูผลลัพธ์</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge tone="success">ผ่านแล้ว</Badge>
              <Badge tone="danger">ยังไม่ผ่าน</Badge>
              <Badge tone="attention">รอตรวจ</Badge>
            </div>
            <Notice tone="primary">ขอบหนาขึ้นและสีกลับเป็นพื้นดำตัวอักษรขาว</Notice>
            <Meter label="สัปดาห์นี้" value={3} max={5} segments valueText="ฝึกแล้ว 3 จาก 5 วัน" />
            <ChoiceList
              name="e-contrast-choice"
              legend="เลือกโหมด"
              defaultValue="a"
              options={[
                { value: "a", title: "ฝึกทีละขั้น" },
                { value: "b", title: "ทดสอบ" },
              ]}
            />
          </div>
        </ElderScope>
      </Example>

      <SubHeading>หน้าหลักตัวอย่าง</SubHeading>

      <Example
        title="หน้าจอที่ประกอบเสร็จ: หน้าหลัก"
        importLine='import { Badge, Button, ElderHeader, ListRow, Meter, Section } from "@/shared/ui";'
        note="ประกอบจาก ElderHeader, Section, Button, Meter และ ListRow เหมือนหน้า /home จริง"
      >
        <ElderScope>
          <ElderHeader greeting="สวัสดีตอนเช้า" name="คุณตัวอย่าง" />
          <Section first eyebrow="แบบฝึกวันนี้" title="จำลำดับ 3 ช่อง">
            <p className="mb-4 text-small text-fg-muted">คอร์สเริ่มต้น · ประมาณ 5 นาที</p>
            <Button href="#elder" fullWidth>
              <Play aria-hidden="true" className="size-icon shrink-0" />
              เริ่มฝึก
            </Button>
          </Section>
          <Section>
            <Meter label="สัปดาห์นี้" value={3} max={5} segments valueText="ฝึกแล้ว 3 จาก 5 วัน" />
          </Section>
          <Section>
            <ListRow
              href="#elder"
              icon={<ChartNoAxesColumn {...iconProp} />}
              title="ผลลัพธ์ของฉัน"
              subtitle="ครั้งล่าสุด ถูก 4 จาก 5 ข้อ"
            />
            <ListRow
              href="#elder"
              icon={<CalendarDays {...iconProp} />}
              title="นัดที่ศูนย์ตัวอย่าง"
              subtitle="พฤหัสบดี · 10:00 น."
              badge={<Badge tone="primary">ยืนยันแล้ว</Badge>}
            />
            <ListRow
              href="#elder"
              icon={<UserRound {...iconProp} />}
              title="ข้อมูลของฉัน"
              subtitle="ความเป็นส่วนตัวและการตั้งค่า"
            />
          </Section>
        </ElderScope>
      </Example>
    </>
  );
}
