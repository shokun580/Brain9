import { cn } from "@/shared/lib/cn";
import { AdminScope, SubHeading } from "../chrome";
import { Example } from "../Example";

type Cell = { n: number; order?: number; twoFinger?: boolean };

// The sequence 1 → 2 → (3 and 7 together) → 4 on a 3x3 grid, cells numbered 1–9.
const cells: Cell[] = [
  { n: 1, order: 1 },
  { n: 2 },
  { n: 3, order: 3, twoFinger: true },
  { n: 4 },
  { n: 5, order: 2 },
  { n: 6 },
  { n: 7, order: 3, twoFinger: true },
  { n: 8 },
  { n: 9, order: 4 },
];

function EditorCell({ cell }: { cell: Cell }) {
  const chosen = cell.order !== undefined && !cell.twoFinger;
  return (
    <div
      className={cn(
        "relative flex aspect-square flex-col items-center justify-center rounded-[10px] border",
        cell.twoFinger
          ? "border-2 border-attention bg-attention-soft text-attention"
          : chosen
            ? "border-primary bg-primary text-on-primary"
            : "border-line-strong bg-surface-subtle text-fg-muted",
      )}
    >
      <span className="absolute top-1 left-1.5 text-micro">{cell.n}</span>
      {cell.order !== undefined ? (
        <span className="text-heading font-bold">{cell.order}</span>
      ) : null}
      {cell.twoFinger ? <span className="text-micro font-bold">สองนิ้ว</span> : null}
    </div>
  );
}

export function AdminEditorGrid() {
  return (
    <>
      <SubHeading>ตารางในหน้าแก้แบบฝึก (ตัวอย่างอ้างอิงสำหรับทีม content)</SubHeading>

      <Example
        title="Editor grid"
        note="ไม่มีคอมโพเนนต์ให้นำเข้า ใช้ div กับโทเคนตามภาพ แล้วใส่ใน PatternEditor ของทีม content ภาพนิ่งจาก div เครื่องมือ ไม่ใช่ของเล่น: ช่องไฟ 8 พิกเซล ขอบ line-strong 1 พิกเซล มุม 10 พิกเซล พื้น surface-subtle เลขช่อง 1 ถึง 9 อยู่มุมซ้ายบน ช่องที่เลือกเป็น primary พร้อมเลขลำดับ ขั้นสองนิ้วใช้ attention-soft ขอบหนา 2 พิกเซล และสองช่องใช้เลขลำดับเดียวกัน"
      >
        <AdminScope>
          <div className="flex flex-wrap items-start gap-6">
            <div
              role="img"
              aria-label="ตัวอย่างลำดับ: ช่อง 1 ลำดับ 1, ช่อง 5 ลำดับ 2, ช่อง 3 และ 7 แตะสองนิ้วพร้อมกันเป็นลำดับ 3, ช่อง 9 ลำดับ 4"
              className="grid w-60 grid-cols-3 gap-2"
            >
              {cells.map((cell) => (
                <EditorCell key={cell.n} cell={cell} />
              ))}
            </div>
            <ul className="m-0 flex list-none flex-col gap-2 p-0 text-body text-fg-2">
              <li>ช่อง 1: ลำดับ 1 (เลือกแล้ว)</li>
              <li>ช่อง 5: ลำดับ 2 (เลือกแล้ว)</li>
              <li>ช่อง 3 และ 7: ลำดับ 3 แตะสองนิ้วพร้อมกัน</li>
              <li>ช่อง 9: ลำดับ 4 (เลือกแล้ว)</li>
              <li>ช่องอื่น: ยังไม่เลือก</li>
            </ul>
          </div>
        </AdminScope>
      </Example>
    </>
  );
}
