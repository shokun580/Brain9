import {
  Badge,
  Button,
  ComingSoon,
  EmptyState,
  Meter,
  Notice,
  ResultBanner,
  StepProgress,
  stepLabel,
} from "@/shared/ui";
import { ElderScope, SubHeading } from "../chrome";
import { Example } from "../Example";

export function ElderStatus() {
  return (
    <>
      <SubHeading>ความคืบหน้าและข้อความบอกสถานะ</SubHeading>

      <Example
        title="StepProgress, stepLabel"
        importLine='import { StepProgress, stepLabel } from "@/shared/ui";'
        note="บอกทีละขั้นด้วยคำว่า “ขั้นที่ X จาก Y” แถบเป็นแค่ภาพประกอบ stepLabel(current, total) ให้ข้อความเดียวกันสำหรับใช้ที่อื่น"
      >
        <ElderScope>
          <div className="flex flex-col gap-5">
            <StepProgress current={1} total={4} />
            <StepProgress current={3} total={4} />
            <p className="text-small text-fg-muted">stepLabel(2, 5) คืนค่า “{stepLabel(2, 5)}”</p>
          </div>
        </ElderScope>
      </Example>

      <Example
        title="Meter"
        importLine='import { Meter } from "@/shared/ui";'
        note="ต้องมี valueText ที่อ่านได้ด้วยตาเสมอ แถบเป็นภาพประกอบ ใช้ segments เมื่อนับเป็นวัน"
      >
        <ElderScope>
          <div className="flex flex-col gap-6">
            <Meter label="สัปดาห์นี้" value={3} max={5} segments valueText="ฝึกแล้ว 3 จาก 5 วัน" />
            <Meter label="ความคืบหน้าของคอร์ส" value={40} max={100} valueText="ทำไปแล้วร้อยละ 40" />
          </div>
        </ElderScope>
      </Example>

      <Example
        title="ResultBanner"
        importLine='import { ResultBanner } from "@/shared/ui";'
        note="ผลของคำตอบ บอกด้วยเครื่องหมาย ✓ หรือ ✕ และคำ ไม่ใช้สีอย่างเดียว คำพูดให้กำลังใจ ไม่ตำหนิ"
      >
        <ElderScope>
          <div className="flex flex-col gap-4">
            <ResultBanner tone="success" title="ถูกต้อง ทำได้ดีมาก" detail="ตอบถูก 4 จาก 5 ข้อ" />
            <ResultBanner tone="danger" title="ยังไม่ถูกต้อง" detail="กรุณาดูลำดับอีกรอบแล้วลองอีกครั้ง" />
          </div>
        </ElderScope>
      </Example>

      <Example
        title="Notice"
        importLine='import { Notice } from "@/shared/ui";'
        note="ข้อความในหน้า มีไอคอนประจำสีเสมอ สี่โทน: primary success danger attention"
      >
        <ElderScope>
          <div className="flex flex-col gap-3">
            <Notice tone="primary" title="ข้อมูลเพิ่มเติม">
              ฝึกวันละ 10 นาทีก็เพียงพอ
            </Notice>
            <Notice tone="success" title="บันทึกแล้ว">
              ผลการฝึกของวันนี้ถูกเก็บไว้เรียบร้อย
            </Notice>
            <Notice tone="danger" title="ยังบันทึกไม่ได้">
              สัญญาณอินเทอร์เน็ตขาดหาย กรุณาลองอีกครั้งในอีกสักครู่
            </Notice>
            <Notice tone="attention" title="โปรดทราบ">
              ช่องนี้ต้องแตะสองนิ้วพร้อมกัน
            </Notice>
          </div>
        </ElderScope>
      </Example>

      <Example
        title="Badge"
        importLine='import { Badge } from "@/shared/ui";'
        note="ป้ายสถานะสั้น ๆ success และ danger มี ✓ ✕ ในตัว"
      >
        <ElderScope>
          <div className="flex flex-wrap gap-3">
            <Badge>ทั่วไป</Badge>
            <Badge tone="primary">ยืนยันแล้ว</Badge>
            <Badge tone="success">ผ่านแล้ว</Badge>
            <Badge tone="danger">ยังไม่ผ่าน</Badge>
            <Badge tone="attention">รอตรวจ</Badge>
          </div>
        </ElderScope>
      </Example>

      <Example
        title="EmptyState, ComingSoon"
        importLine='import { ComingSoon, EmptyState } from "@/shared/ui";'
        note="มีแต่ข้อความและปุ่ม ไม่มีรูปประกอบและไม่มีกรอบ ComingSoon ใช้แทนทั้งหน้าของเส้นทางที่ยังไม่ได้สร้าง"
      >
        <ElderScope>
          <EmptyState
            title="ยังไม่มีผลการฝึก"
            description="เริ่มฝึกครั้งแรกได้ทันที ใช้เวลาไม่ถึง 5 นาที"
            action={<Button href="#elder">เริ่มฝึก</Button>}
          />
          <ComingSoon title="ผลลัพธ์ของฉัน" owner="analytics" />
        </ElderScope>
      </Example>
    </>
  );
}
