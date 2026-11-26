import { Play } from "lucide-react";
import type { ReactNode } from "react";
import { AdminSection, Badge, Button, TableCard, TableSkeleton, TextField } from "@/shared/ui";
import { AdminScope, ElderScope, Part } from "../chrome";
import { courseColumns } from "../fake-courses";
import { Example } from "../Example";

/** One side of a pair: the verdict as a badge (✓ or ✕ and words), the picture, the reason. */
function Side({ good, reason, children }: { good: boolean; reason: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div>
        <Badge tone={good ? "success" : "danger"}>{good ? "ควรทำ" : "ไม่ควรทำ"}</Badge>
      </div>
      {children}
      <p className="text-small text-fg-muted">{reason}</p>
    </div>
  );
}

function Pair({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

const icon = { "aria-hidden": true, strokeWidth: 1.9, className: "size-icon shrink-0" } as const;

// DON'T: a hand-made button with a raw colour and Tailwind's own sizes. It exists only as the
// bad half of a Do / Don't pair; never copy it. Every button is `Button` from @/shared/ui.
const handMadeButton = (
  <button type="button" className="rounded-full bg-[#2f80ed] px-3 py-1 text-sm text-white">
    บันทึก
  </button>
);

export function DoDontSection() {
  return (
    <Part id="dodont" intro="หกข้อที่พลาดบ่อยที่สุด ด้านซ้ายคือแบบที่ถูก ด้านขวาคือแบบที่ห้ามทำ">
      <Example
        headingLevel={3}
        title="ฟอร์มและส่วนของหน้าไม่ต้องห่อด้วยการ์ด"
        importLine='import { AdminSection, Button, TextField } from "@/shared/ui";'
      >
        <Pair>
          <AdminScope>
            <Side good reason="ส่วนเรียบ ๆ มีหัวข้อกับเส้นใต้ ไม่มีกรอบและไม่มีเงา">
              <AdminSection title="ข้อมูลคอร์ส">
                <div className="flex flex-col gap-3">
                  <TextField label="ชื่อคอร์ส" name="d-flat-title" />
                  <div>
                    <Button>บันทึก</Button>
                  </div>
                </div>
              </AdminSection>
            </Side>
          </AdminScope>
          <AdminScope>
            <Side good={false} reason="การ์ดมีเงาล้อมฟอร์ม ใช้การ์ดได้เฉพาะ StatTile และ TableCard">
              <div className="rounded-panel border border-line bg-surface p-5 shadow-overlay">
                <h3 className="text-heading font-bold">ข้อมูลคอร์ส</h3>
                <div className="mt-3 flex flex-col gap-3">
                  <TextField label="ชื่อคอร์ส" name="d-card-title" />
                  <div>
                    <Button>บันทึก</Button>
                  </div>
                </div>
              </div>
            </Side>
          </AdminScope>
        </Pair>
      </Example>

      <Example
        headingLevel={3}
        title="บอกผลด้วยคำและเครื่องหมาย ไม่ใช้สีอย่างเดียว"
        importLine='import { Badge } from "@/shared/ui";'
      >
        <Pair>
          <ElderScope>
            <Side good reason="มี ✓ ✕ และคำ คนที่แยกสีไม่ออกก็อ่านได้">
              <div className="flex flex-col gap-2">
                <Badge tone="success">ข้อ 1 ถูก</Badge>
                <Badge tone="danger">ข้อ 2 ยังไม่ถูก</Badge>
              </div>
            </Side>
          </ElderScope>
          <ElderScope>
            <Side good={false} reason="จุดสีเขียวกับแดงโดยไม่มีคำ ใช้ไม่ได้">
              <div className="flex flex-col gap-2 text-body">
                <p className="flex items-center gap-2">
                  <span className="size-4 rounded-full bg-success" />
                  ข้อ 1
                </p>
                <p className="flex items-center gap-2">
                  <span className="size-4 rounded-full bg-danger" />
                  ข้อ 2
                </p>
              </div>
            </Side>
          </ElderScope>
        </Pair>
      </Example>

      <Example
        headingLevel={3}
        title="ไอคอนต้องมีคำกำกับ"
        importLine='import { Button } from "@/shared/ui";'
      >
        <Pair>
          <ElderScope>
            <Side good reason="ไอคอนอยู่คู่กับคำว่า “เริ่มฝึก”">
              <Button>
                <Play {...icon} />
                เริ่มฝึก
              </Button>
            </Side>
          </ElderScope>
          <ElderScope>
            <Side good={false} reason="ไอคอนลำพัง ผู้สูงอายุไม่รู้ว่ากดแล้วเกิดอะไร">
              <div>
                <Button iconOnly aria-label="เริ่มฝึก">
                  <Play {...icon} />
                </Button>
              </div>
            </Side>
          </ElderScope>
        </Pair>
      </Example>

      <Example
        headingLevel={3}
        title="หนึ่งหน้าจอ หนึ่งปุ่มหลัก"
        importLine='import { Button } from "@/shared/ui";'
      >
        <Pair>
          <ElderScope>
            <Side good reason="ปุ่มหลักหนึ่งปุ่ม ปุ่มรองเป็น quiet">
              <div className="flex flex-col gap-2">
                <Button fullWidth>เริ่มฝึก</Button>
                <Button fullWidth variant="quiet">
                  ไว้ทีหลัง
                </Button>
              </div>
            </Side>
          </ElderScope>
          <ElderScope>
            <Side good={false} reason="สองปุ่มหลักแย่งกัน ไม่รู้ว่าควรกดอะไร">
              <div className="flex flex-col gap-2">
                <Button fullWidth>เริ่มฝึก</Button>
                <Button fullWidth>ดูผลลัพธ์</Button>
              </div>
            </Side>
          </ElderScope>
        </Pair>
      </Example>

      <Example
        headingLevel={3}
        title="ระหว่างโหลดใช้โครงสีเทา ไม่ใช้ข้อความ"
        importLine='import { TableCard, TableSkeleton } from "@/shared/ui";'
      >
        <Pair>
          <AdminScope>
            <Side good reason="โครงมีรูปร่างเดียวกับตารางจริง หน้าจึงไม่กระตุก">
              <TableCard>
                <TableSkeleton
                  label="กำลังโหลดตัวอย่างที่ถูก"
                  columns={courseColumns.slice(0, 3)}
                  rows={2}
                />
              </TableCard>
            </Side>
          </AdminScope>
          <AdminScope>
            <Side good={false} reason="ข้อความ “กำลังโหลด…” ทำให้หน้ากระโดดเมื่อข้อมูลมา">
              <p className="text-body text-fg-muted">กำลังโหลด…</p>
            </Side>
          </AdminScope>
        </Pair>
      </Example>

      <Example
        headingLevel={3}
        title="ใช้ Button ไม่ต้องทำปุ่มเอง"
        importLine='import { Button } from "@/shared/ui";'
      >
        <Pair>
          <ElderScope>
            <Side good reason="Button มาพร้อมขนาด 64 พิกเซล สี โฟกัส และโหมดสีตัดกันสูง">
              <div>
                <Button>บันทึก</Button>
              </div>
            </Side>
          </ElderScope>
          <ElderScope>
            <Side good={false} reason="ปุ่มเขียนเองที่ใช้สีดิบ เล็ก และไม่เปลี่ยนตามโหมดสีตัดกันสูง">
              <div className="flex flex-col items-start gap-2">
                <p className="text-small font-bold text-danger">✕ อย่าทำ</p>
                {handMadeButton}
              </div>
            </Side>
          </ElderScope>
        </Pair>
      </Example>
    </Part>
  );
}
