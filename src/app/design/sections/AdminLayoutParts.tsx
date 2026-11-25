import {
  CalendarDays,
  LayoutGrid,
  List,
  RotateCcw,
  TriangleAlert,
  Users,
  Dumbbell,
} from "lucide-react";
import {
  AdminSection,
  Button,
  PageHeader,
  SaveBar,
  SegmentedControl,
  StatTile,
  Tabs,
} from "@/shared/ui";
import { AdminScope, SubHeading } from "../chrome";
import { Example } from "../Example";

const icon = { "aria-hidden": true, strokeWidth: 1.9, className: "size-icon" } as const;

export function AdminLayoutParts() {
  return (
    <>
      <SubHeading>หัวหน้า หัวข้อ และตัวเลข</SubHeading>

      <Example
        title="PageHeader"
        importLine='import { Button, PageHeader } from "@/shared/ui";'
        note="บนสุดของทุกหน้าผู้ดูแล: เส้นทาง (breadcrumbs) หัวข้อ h1 คำอธิบายสั้น ๆ และปุ่มหลักหนึ่งปุ่ม รายการสุดท้ายของเส้นทางคือหน้าปัจจุบัน"
      >
        <AdminScope>
          <PageHeader
            title="คอร์สและแบบฝึก"
            breadcrumbs={[{ label: "เนื้อหาและผล", href: "#admin" }, { label: "คอร์สและแบบฝึก" }]}
            description="ดูคอร์สทั้งหมดและสร้างคอร์สใหม่"
            action={<Button href="#admin">สร้างคอร์สใหม่</Button>}
          />
        </AdminScope>
      </Example>

      <Example
        title="AdminSection"
        importLine='import { AdminSection, Button } from "@/shared/ui";'
        note="หัวข้อพร้อมเส้นใต้ ไม่มีกรอบและไม่มีพื้น มีจำนวน (count) และปุ่มท้ายแถวได้ ห่างกัน 32 พิกเซล"
      >
        <AdminScope>
          <AdminSection
            title="คอร์สทั้งหมด"
            count="48 รายการ"
            description="เรียงตามที่แก้ไขล่าสุด"
            action={
              <Button size="sm" variant="secondary">
                ส่งออกรายการ
              </Button>
            }
          >
            <p className="text-body text-fg-2">เนื้อหาของส่วนนี้ เช่น ตาราง ฟอร์ม หรือกลุ่มตัวเลข</p>
          </AdminSection>
          <AdminSection title="ส่วนถัดไป">
            <p className="text-body text-fg-2">ส่วนต่อไปห่างลงมา 32 พิกเซล</p>
          </AdminSection>
        </AdminScope>
      </Example>

      <Example
        title="StatTile"
        importLine='import { StatTile } from "@/shared/ui";'
        note="การ์ดของตัวเลขหนึ่งค่า วางเป็นตารางที่ปรับตามความกว้าง บรรทัดการเปลี่ยนแปลง (delta) มีไอคอนและคำเสมอ"
      >
        <AdminScope>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3">
            <StatTile
              icon={<Users {...icon} />}
              label="ผู้ใช้งานที่ใช้งานอยู่"
              value="128"
              unit="คน"
              delta={{ text: "เพิ่มขึ้น 6 คน", tone: "up" }}
            />
            <StatTile
              icon={<Dumbbell {...icon} />}
              label="ฝึกแล้ววันนี้"
              value="42"
              unit="ครั้ง"
              delta={{ text: "เท่าเมื่อวาน", tone: "flat" }}
            />
            <StatTile icon={<CalendarDays {...icon} />} label="นัดสัปดาห์นี้" value="17" unit="นัด" />
            <StatTile
              icon={<TriangleAlert {...icon} />}
              label="รอตรวจสอบ"
              value="3"
              unit="รายการ"
              delta={{ text: "ควรดูวันนี้", tone: "warn" }}
            />
          </div>
        </AdminScope>
      </Example>

      <SubHeading>การนำทางและการเลือก</SubHeading>

      <Example
        title="Tabs"
        importLine='import { Tabs } from "@/shared/ui";'
        note="แท็บเป็นลิงก์ แต่ละแท็บมี URL ของตัวเอง จึงรีโหลดและแชร์ได้ ทำเครื่องหมาย active ที่แท็บปัจจุบัน"
      >
        <AdminScope>
          <Tabs
            label="สถานะคอร์ส"
            items={[
              { href: "/admin/content/courses", label: "ทั้งหมด", count: 48, active: true },
              { href: "/admin/content/courses?status=ok", label: "เปิดใช้งาน", count: 30 },
              { href: "/admin/content/courses?status=draft", label: "ฉบับร่าง", count: 12 },
            ]}
          />
        </AdminScope>
      </Example>

      <Example
        title="SegmentedControl"
        importLine='import { SegmentedControl } from "@/shared/ui";'
        note="ตัวเลือกสั้น ๆ 2 ถึง 3 อย่าง เป็นช่องวิทยุของเบราว์เซอร์ ใช้ได้โดยไม่ต้องมี JavaScript ใส่ onValueChange ได้เมื่อหน้าเป็น client component"
      >
        <AdminScope>
          <SegmentedControl
            name="a-view"
            legend="รูปแบบการแสดงผล"
            defaultValue="list"
            options={[
              {
                value: "list",
                label: "รายการ",
                icon: <List strokeWidth={1.9} className="size-icon-sm" />,
              },
              {
                value: "grid",
                label: "ตาราง",
                icon: <LayoutGrid strokeWidth={1.9} className="size-icon-sm" />,
              },
            ]}
          />
        </AdminScope>
      </Example>

      <SubHeading>ปุ่ม และแถบบันทึก</SubHeading>

      <Example
        title="Button ฝั่งผู้ดูแล"
        importLine='import { Button } from "@/shared/ui";'
        note="ปุ่มเล็กกว่าฝั่งผู้สูงอายุ (สูง 36 พิกเซล) ปุ่มที่มีแต่ไอคอน (iconOnly) ใช้ได้เฉพาะฝั่งนี้ และต้องมี aria-label"
      >
        <AdminScope>
          <div className="flex flex-wrap items-center gap-3">
            <Button>บันทึก</Button>
            <Button variant="secondary">ยกเลิก</Button>
            <Button variant="quiet">ดูตัวอย่าง</Button>
            <Button variant="danger">ระงับบัญชี</Button>
            <Button size="sm" variant="secondary">
              ขนาดเล็ก
            </Button>
            <Button variant="secondary" iconOnly aria-label="รีเฟรชรายการ">
              <RotateCcw {...icon} />
            </Button>
            <Button disabled>ปิดใช้งาน</Button>
          </div>
        </AdminScope>
      </Example>

      <Example
        title="SaveBar"
        importLine='import { Button, SaveBar } from "@/shared/ui";'
        note="แถบท้ายหน้าแก้ไขข้อมูลเดิม บอก “มีการแก้ไขที่ยังไม่บันทึก” เมื่อ dirty ตัวจริงติดอยู่ล่างจอ ที่นี่แสดงในแนวไหลปกติ"
      >
        <AdminScope>
          <div className="flex flex-col gap-4 [&>div]:static">
            <SaveBar dirty>
              <Button variant="secondary">ยกเลิก</Button>
              <Button>บันทึก</Button>
            </SaveBar>
            <SaveBar dirty={false}>
              <Button variant="secondary" disabled>
                ยกเลิก
              </Button>
              <Button disabled>บันทึก</Button>
            </SaveBar>
          </div>
        </AdminScope>
      </Example>
    </>
  );
}
