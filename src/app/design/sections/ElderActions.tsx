import { Play, RotateCcw } from "lucide-react";
import { Button, ElderHeader } from "@/shared/ui";
import { ElderScope, SubHeading } from "../chrome";
import { Example } from "../Example";

const icon = { "aria-hidden": true, strokeWidth: 1.9, className: "size-icon shrink-0" } as const;

export function ElderActions() {
  return (
    <>
      <SubHeading>ส่วนหัวและปุ่ม</SubHeading>

      <Example
        title="ElderHeader"
        importLine='import { ElderHeader } from "@/shared/ui";'
        note="ใช้ title อย่างเดียว หรือ greeting กับ name คู่กัน ตัวหัวข้อคือ h1 ของหน้า มีปุ่มย้อนกลับ (backHref) และปุ่มรูปแคปซูลได้หนึ่งปุ่ม (action)"
      >
        <ElderScope>
          <ElderHeader
            title="คอร์สของฉัน"
            backHref="#elder-header"
            action={
              <Button variant="quiet" size="sm" className="rounded-full">
                ก ขนาดตัวอักษร
              </Button>
            }
          />
          <div className="mt-6">
            <ElderHeader greeting="สวัสดีตอนเช้า" name="คุณตัวอย่าง" />
          </div>
        </ElderScope>
      </Example>

      <Example
        title="Button: รูปแบบ"
        importLine='import { Button } from "@/shared/ui";'
        note="หนึ่งหน้าจอมีปุ่มหลัก (primary) ได้หนึ่งปุ่มเท่านั้น ปุ่มอื่นใช้ secondary หรือ quiet ปุ่มยกเลิกสิ่งที่ย้อนไม่ได้ใช้ danger"
      >
        <ElderScope>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">เริ่มฝึก</Button>
            <Button variant="secondary">ดูผลลัพธ์</Button>
            <Button variant="quiet">ไว้ทีหลัง</Button>
            <Button variant="danger">ออกจากระบบ</Button>
          </div>
        </ElderScope>
      </Example>

      <Example
        title="Button: ขนาด ไอคอน เต็มความกว้าง"
        importLine='import { Button } from "@/shared/ui";'
        note="ไอคอนต้องมีคำกำกับเสมอ ฝั่งผู้สูงอายุไม่ใช้ปุ่มที่มีแต่ไอคอน ขนาด sm ใช้ในที่แคบ เช่น ปุ่มใน ElderHeader"
      >
        <ElderScope>
          <div className="flex flex-col gap-3">
            <Button size="sm" variant="secondary" className="self-start">
              ปุ่มขนาดเล็ก (sm)
            </Button>
            <Button className="self-start">
              <Play {...icon} />
              เริ่มฝึก
            </Button>
            <Button variant="secondary" className="self-start">
              <RotateCcw {...icon} />
              เล่นอีกครั้ง
            </Button>
            <Button fullWidth>ถัดไป (เต็มความกว้าง)</Button>
          </div>
        </ElderScope>
      </Example>

      <Example
        title="Button: ปิดใช้งาน และเป็นลิงก์"
        importLine='import { Button } from "@/shared/ui";'
        note="ใส่ href เพื่อให้เป็นลิงก์ (a) ปุ่มที่ปิดใช้งานต้องบอกเหตุผลใกล้ ๆ ลิงก์ที่ปิดใช้งานไม่พาไปไหน"
      >
        <ElderScope>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled>ปิดใช้งาน</Button>
            <Button href="#elder-header" variant="secondary">
              ลิงก์ไปด้านบน
            </Button>
            <Button href="#elder-header" variant="secondary" disabled>
              ลิงก์ที่ปิดอยู่
            </Button>
          </div>
          <p className="mt-3 text-small text-fg-muted">ปุ่ม “ปิดใช้งาน” ยังกดไม่ได้ เพราะยังไม่ได้เลือกข้อมูล</p>
        </ElderScope>
      </Example>
    </>
  );
}
