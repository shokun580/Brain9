import { Play, RotateCcw } from "lucide-react";
import { Button, DisplaySettings, ElderHeader, TextLink } from "@/shared/ui";
import { ElderScope, SubHeading } from "../chrome";
import { Example } from "../Example";

const icon = { "aria-hidden": true, className: "size-icon shrink-0" } as const;

export function ElderActions() {
  return (
    <>
      <SubHeading>ส่วนหัวและปุ่ม</SubHeading>

      <Example
        title="ElderHeader"
        importLine='import { DisplaySettings, ElderHeader } from "@/shared/ui";'
        note="ใช้ title อย่างเดียว หรือ greeting กับ name คู่กัน ตัวหัวข้อคือ h1 ของหน้า มีปุ่มย้อนกลับ (backHref เมื่อย้อนไปอีกที่อยู่หนึ่ง หรือ onBack เมื่อขั้นก่อนหน้าเก็บอยู่ใน state ของ client component) ปุ่มย้อนกลับเว้นระยะจากหัวข้อด้านล่าง และปุ่มรูปแคปซูลได้หนึ่งปุ่ม (action) ซึ่งคือ DisplaySettings ปุ่มตั้งขนาดตัวอักษรและสีตัดกันสูง กดแล้วทุกตัวอย่างฝั่งผู้สูงอายุในหน้านี้เปลี่ยนตามจริง และจำค่าไว้ในเบราว์เซอร์นี้"
      >
        <ElderScope>
          <ElderHeader title="คอร์สของฉัน" backHref="#elder" action={<DisplaySettings />} />
          <div className="mt-6">
            <ElderHeader greeting="สวัสดีตอนเช้า" name="คุณตัวอย่าง" />
          </div>
        </ElderScope>
      </Example>

      <Example
        title="Button: รูปแบบ"
        importLine='import { Button } from "@/shared/ui";'
        note="หนึ่งหน้าจอมีปุ่มหลัก (primary) ได้หนึ่งปุ่มเท่านั้น ปุ่มอื่นใช้ secondary หรือ quiet ปุ่มของการกระทำที่ย้อนกลับไม่ได้ใช้ danger เช่น ยกเลิกการจอง ส่วนการออกจากระบบไม่ได้ทำลายอะไร จึงไม่ใช้ danger"
      >
        <ElderScope>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">เริ่มฝึก</Button>
            <Button variant="secondary">ดูผลลัพธ์</Button>
            <Button variant="quiet">ไว้ภายหลัง</Button>
            <Button variant="danger">ยกเลิกการจอง</Button>
          </div>
        </ElderScope>
      </Example>

      <Example
        title="Button: ขนาด ไอคอน เต็มความกว้าง"
        importLine='import { Button } from "@/shared/ui";'
        note="ไอคอนต้องมีคำกำกับเสมอ ฝั่งผู้สูงอายุไม่ใช้ปุ่มที่มีแต่ไอคอน ขนาด sm ใช้ในที่แคบ เช่น ปุ่มใน ElderHeader"
      >
        <ElderScope>
          <div className="flex flex-col items-start gap-3">
            <Button size="sm" variant="secondary">
              ปุ่มขนาดเล็ก (sm)
            </Button>
            <Button>
              <Play {...icon} />
              เริ่มฝึก
            </Button>
            <Button variant="secondary">
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
            <Button href="#elder" variant="secondary">
              ลิงก์ไปด้านบน
            </Button>
            <Button href="#elder" variant="secondary" disabled>
              ลิงก์ที่ปิดอยู่
            </Button>
          </div>
          <p className="mt-3 text-small text-fg-muted">ปุ่ม “ปิดใช้งาน” ยังกดไม่ได้ เพราะยังไม่ได้เลือกข้อมูล</p>
        </ElderScope>
      </Example>

      <Example
        title="TextLink"
        importLine='import { TextLink } from "@/shared/ui";'
        note="ทางไปอีกหน้าจอที่ต้องเบากว่าปุ่มของหน้า เช่น ลืมรหัส หรือทางจากหน้าเข้าสู่ระบบไปหน้าสมัครสมาชิก เป็นคำที่ขีดเส้นใต้เสมอ ไม่ใช้ไอคอนอย่างเดียว พื้นที่กดสูงเท่าปุ่มขนาดเล็ก ใส่ href เพื่อให้เป็นลิงก์ หรือ onClick (ใน client component) เพื่อให้เป็นปุ่ม ไม่ใช้แทน Button: การกระทำของหน้าจอยังเป็น Button"
      >
        <ElderScope>
          <div className="flex flex-col items-start gap-2">
            <TextLink href="#elder">ลืมรหัส</TextLink>
            <div className="flex flex-wrap items-center gap-x-2">
              <span className="text-body text-fg-2">ยังไม่มีบัญชี</span>
              <TextLink href="#elder">สมัครสมาชิก</TextLink>
            </div>
          </div>
        </ElderScope>
      </Example>
    </>
  );
}
