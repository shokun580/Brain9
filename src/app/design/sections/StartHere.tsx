import Link from "next/link";
import { BrandMark } from "@/shared/ui";
import { Part } from "../chrome";
import { Example } from "../Example";

const rules = [
  "สร้างหน้าจอจากของในหน้านี้เท่านั้น",
  "ใช้สีและขนาดจากโทเคนเท่านั้น ห้ามเขียนค่าสีหรือขนาดเอง",
  "ถ้าขาดอะไร ให้เปิด issue ป้าย infra",
];

export function StartHereSection() {
  return (
    <Part id="start" intro="รายการของที่ใช้สร้างหน้าจอทั้งหมดของ Brain9 ทั้งฝั่งผู้สูงอายุและฝั่งผู้ดูแล">
      <ol className="mt-4 flex list-decimal flex-col gap-1 pl-6 text-lead font-bold text-fg">
        {rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ol>

      <p className="mt-4 text-body text-fg-2">
        กฎเต็มอยู่ที่ <code className="font-mono text-small">docs/design-system.md</code> ฝั่งผู้สูงอายุอยู่ใน
        <code className="mx-1 font-mono text-small">data-ui=&quot;elder&quot;</code>
        ฝั่งผู้ดูแลอยู่ใน
        <code className="mx-1 font-mono text-small">data-ui=&quot;admin&quot;</code>
        ซึ่งหน้านี้ครอบแต่ละตัวอย่างไว้ให้แล้ว
      </p>
      <p className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-body">
        <Link href="/admin" className="text-primary-press underline">
          ดูหน้าผู้ดูแลจริง (/admin)
        </Link>
        <Link href="/home" className="text-primary-press underline">
          ดูหน้าหลักผู้สูงอายุจริง (/home)
        </Link>
      </p>
      <p className="mt-2 text-small text-fg-muted">
        ข้อมูลทุกอย่างในหน้านี้เป็นข้อมูลสมมุติ ไม่มีชื่อ เบอร์โทร หรือผลของคนจริง
      </p>

      <Example
        title="BrandMark"
        importLine='import { BrandMark } from "@/shared/ui";'
        note="ตารางแบบฝึก 3x3 ที่ไฟติดแนวทแยง ปรับขนาดด้วย className เช่น size-8 size-12 size-16"
      >
        <div className="flex items-end gap-6 rounded-panel border-[length:var(--b9-border)] border-line p-4">
          <BrandMark className="size-8" label="Brain9 ขนาดเล็ก" />
          <BrandMark className="size-12" label="Brain9 ขนาดกลาง" />
          <BrandMark className="size-16" label="Brain9 ขนาดใหญ่" />
        </div>
      </Example>
    </Part>
  );
}
