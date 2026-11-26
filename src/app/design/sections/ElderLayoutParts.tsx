import { CalendarDays, ChartNoAxesColumn, House, LayoutGrid, UserRound } from "lucide-react";
import {
  Badge,
  ListRow,
  ListRowSkeleton,
  Section,
  SkeletonBlock,
  SkeletonLine,
  SkeletonRegion,
  TabBarView,
  type TabBarItem,
} from "@/shared/ui";
import { ConfirmDialogDemo, ToastDemo } from "../Demos";
import { ElderScope, SubHeading } from "../chrome";
import { Example } from "../Example";

const rowIcon = {
  "aria-hidden": true,
  strokeWidth: 1.9,
  className: "size-icon text-primary-press",
} as const;
const tabIcon = { "aria-hidden": true, strokeWidth: 1.9, className: "size-icon" } as const;

const tabs: TabBarItem[] = [
  { href: "/home", label: "หน้าหลัก", icon: <House {...tabIcon} /> },
  { href: "/courses", label: "คอร์ส", icon: <LayoutGrid {...tabIcon} /> },
  { href: "/results", label: "ผลลัพธ์", icon: <ChartNoAxesColumn {...tabIcon} /> },
  { href: "/booking", label: "จองคิว", icon: <CalendarDays {...tabIcon} /> },
];

export function ElderLayoutParts() {
  return (
    <>
      <SubHeading>การจัดหน้า รายการ และกล่องข้อความ</SubHeading>

      <Example
        title="Section, ListRow"
        importLine='import { Badge, ListRow, Section } from "@/shared/ui";'
        note="Section คั่นด้วยช่องว่างและเส้นบาง ๆ ไม่ใช่การ์ด ทั้งแถวของ ListRow กดได้ ลูกศรท้ายแถวเป็นไอคอนเดียวที่ไม่ต้องมีคำกำกับ"
      >
        <ElderScope>
          <Section
            first
            eyebrow="วันนี้"
            title="รายการของฉัน"
            action={<Badge tone="primary">2 รายการ</Badge>}
          >
            <ListRow
              href="#elder"
              icon={<ChartNoAxesColumn {...rowIcon} />}
              title="ผลลัพธ์ของฉัน"
              subtitle="ครั้งล่าสุด ถูก 4 จาก 5 ข้อ"
            />
            <ListRow
              href="#elder"
              icon={<CalendarDays {...rowIcon} />}
              title="นัดที่ศูนย์ตัวอย่าง"
              subtitle="พฤหัสบดี 10:00 น."
              badge={<Badge tone="primary">ยืนยันแล้ว</Badge>}
            />
          </Section>
          <Section title="ตั้งค่า">
            <ListRow
              href="#elder"
              icon={<UserRound {...rowIcon} />}
              title="ข้อมูลของฉัน"
              subtitle="ความเป็นส่วนตัวและการตั้งค่า"
            />
          </Section>
        </ElderScope>
      </Example>

      <Example
        title="TabBarView"
        importLine='import { TabBarView } from "@/shared/ui";'
        note="แถบเมนูล่าง 4 เมนู ตัวจริง (TabBar) อยู่ใน layout ของฝั่งผู้สูงอายุ และติดอยู่ล่างจอ ที่นี่แสดงในแนวไหลปกติ โดยให้หน้าหลักเป็นเมนูปัจจุบัน"
      >
        <ElderScope>
          <div className="[&>nav]:static">
            <TabBarView items={tabs} pathname="/home" />
          </div>
        </ElderScope>
      </Example>

      <Example
        title="ConfirmDialog"
        importLine='import { ConfirmDialog } from "@/shared/ui";'
        note="ใช้ก่อนทำสิ่งที่ย้อนไม่ได้ ปุ่มยกเลิกมาก่อนและถูกโฟกัสไว้ก่อน บอกผลที่จะเกิดขึ้น โทน danger ใช้กับการกระทำที่ทำลายหรือย้อนไม่ได้เท่านั้น (ดูตัวอย่างฝั่งผู้ดูแล) ลองกดดู"
      >
        <ElderScope>
          <div className="flex flex-col gap-4">
            <ConfirmDialogDemo
              triggerLabel="เริ่มฝึกเลย"
              title="เริ่มฝึกตอนนี้ไหม"
              confirmLabel="เริ่มฝึก"
              tone="primary"
            >
              <p>ใช้เวลาประมาณ 5 นาที ออกกลางคันได้ตลอด</p>
            </ConfirmDialogDemo>
            <ConfirmDialogDemo
              triggerLabel="ออกจากระบบ"
              title="ออกจากระบบไหม"
              confirmLabel="ออกจากระบบ"
              tone="primary"
            >
              <p>ถ้าออก ต้องเข้าสู่ระบบใหม่ด้วยเบอร์โทรและรหัสผ่านอีกครั้ง</p>
            </ConfirmDialogDemo>
          </div>
        </ElderScope>
      </Example>

      <Example
        title="Toast"
        importLine='import { Toast } from "@/shared/ui";'
        note="ข้อความสั้น ๆ ยืนยันว่าทำสำเร็จหลังทำเสร็จเท่านั้น ข้อผิดพลาดแสดงข้างฟอร์ม (ข้อความใต้ช่อง หรือ Notice โทน danger) ไม่แสดงใน Toast อย่างเดียว ตำแหน่งและเวลาที่แสดงเป็นหน้าที่ของหน้าที่เรียกใช้"
      >
        <ElderScope>
          <ToastDemo />
        </ElderScope>
      </Example>

      <Example
        title="SkeletonLine, SkeletonBlock, SkeletonRegion"
        importLine='import { SkeletonBlock, SkeletonLine, SkeletonRegion } from "@/shared/ui";'
        note="โครงสีเทาระหว่างโหลด สูงเท่าตัวอักษรจริงเพื่อให้หน้าไม่กระตุกตอนข้อมูลมา ห่อด้วย SkeletonRegion หนึ่งชั้นต่อพื้นที่ที่กำลังโหลด และห้ามมีปุ่มหรือช่องกรอกข้างใน"
      >
        <ElderScope>
          <SkeletonRegion label="กำลังโหลดตัวอย่าง">
            <div className="flex flex-col gap-3">
              <SkeletonLine text="heading" width="md" />
              <SkeletonLine width="lg" />
              <SkeletonLine text="small" width="sm" />
              <div className="flex items-center gap-3">
                <SkeletonBlock shape="icon" />
                <SkeletonBlock shape="control" />
              </div>
            </div>
          </SkeletonRegion>
        </ElderScope>
      </Example>

      <Example
        title="ListRowSkeleton"
        importLine='import { ListRowSkeleton } from "@/shared/ui";'
        note="กล่องเดียวกับ ListRow ใช้เป็น fallback ของรายการ"
      >
        <ElderScope>
          <ListRowSkeleton label="กำลังโหลดรายการ" rows={2} />
        </ElderScope>
      </Example>
    </>
  );
}
