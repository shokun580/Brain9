import type { ReactNode } from "react";
import {
  AdminSection,
  Button,
  ChoiceList,
  ElderHeader,
  PageHeader,
  SaveBar,
  Select,
  StatTile,
  StepProgress,
  TableCard,
  TableSkeleton,
  TextField,
} from "@/shared/ui";
import { Activity, CalendarDays, Users } from "lucide-react";
import { CourseTable } from "../CourseTable";
import { AdminScope, ElderScope, Part } from "../chrome";
import { courseColumns } from "../fake-courses";
import { Example } from "../Example";

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-2 overflow-x-auto rounded-control bg-surface-muted px-3 py-2 font-mono text-small text-fg-2">
      <code>{children}</code>
    </pre>
  );
}

function Recipe({ children, code }: { children: ReactNode; code: string }) {
  return (
    <>
      {children}
      <Code>{code}</Code>
    </>
  );
}

const icon = { "aria-hidden": true, strokeWidth: 1.9, className: "size-icon" } as const;

const listCode = `<PageHeader title="คอร์สและแบบฝึก" breadcrumbs={[…]} action={<Button href="…">สร้างคอร์สใหม่</Button>} />
<AdminSection title="คอร์สทั้งหมด" count="48 รายการ">
  <TableCard toolbar={filters} footer={<Pagination … />}>
    <Table aria-label="…">…</Table>
  </TableCard>
</AdminSection>`;

const formCode = `<PageHeader title="แก้ไขคอร์ส" breadcrumbs={[…]} />
<AdminSection title="ข้อมูลคอร์ส">
  <form action={formAction} className="flex max-w-[35rem] flex-col gap-5">
    <TextField … />
    <div><Button type="submit">บันทึก</Button></div>
  </form>
</AdminSection>
<SaveBar dirty={dirty}>…</SaveBar> {/* เฉพาะหน้าที่แก้ข้อมูลเดิม */}`;

const overviewCode = `<PageHeader title="ภาพรวม" description="…" />
<AdminSection title="สรุปวันนี้">
  <div className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3">
    <StatTile icon={…} label="…" value="128" unit="คน" delta={…} />
  </div>
</AdminSection>`;

const stepCode = `<ElderHeader title="ตั้งค่าการฝึก" backHref="…" />
<StepProgress current={2} total={4} />
<ChoiceList name="…" legend="คำถามเดียวต่อหนึ่งหน้า" options={[…]} />
<Button fullWidth>ถัดไป</Button> {/* ปุ่มหลักหนึ่งปุ่ม */}`;

const loadingCode = `<PageHeader title="คอร์สและแบบฝึก" … />
<AdminSection title="คอร์สทั้งหมด">
  <Reveal fallback={<TableCard><TableSkeleton label="กำลังโหลด…" columns={courseColumns} /></TableCard>}>
    <CourseList /> {/* async: อ่านฐานข้อมูล */}
  </Reveal>
</AdminSection>`;

export function RecipesSection() {
  return (
    <Part id="recipes" intro="หน้าจอใหม่ทุกหน้าเริ่มจากหนึ่งในห้าแบบนี้ โค้ดใต้ภาพเป็นโครงโดยย่อ">
      <Example
        title="หน้ารายการของผู้ดูแล"
        importLine='import { AdminSection, Button, PageHeader, Pagination, Table, TableCard } from "@/shared/ui";'
        note="PageHeader → AdminSection → TableCard (ตัวกรอง ตาราง Pagination)"
      >
        <AdminScope>
          <Recipe code={listCode}>
            <PageHeader
              title="คอร์สและแบบฝึก"
              breadcrumbs={[
                { label: "เนื้อหาและผล", href: "#recipe-list" },
                { label: "คอร์สและแบบฝึก" },
              ]}
              action={<Button href="#recipe-list">สร้างคอร์สใหม่</Button>}
            />
            <AdminSection title="คอร์สทั้งหมด" count="48 รายการ">
              <CourseTable rows={3} label="คอร์สในตัวอย่างหน้ารายการ" />
            </AdminSection>
          </Recipe>
        </AdminScope>
      </Example>

      <Example
        title="หน้าฟอร์มของผู้ดูแล"
        importLine='import { AdminSection, Button, PageHeader, SaveBar, Select, TextField } from "@/shared/ui";'
        note="PageHeader → AdminSection → ฟอร์มคอลัมน์เดียว (max-w-[35rem]) ปุ่มอยู่ใต้ช่องทางซ้าย → SaveBar เมื่อแก้ข้อมูลเดิม"
      >
        <AdminScope>
          <Recipe code={formCode}>
            <PageHeader
              title="แก้ไขคอร์ส"
              breadcrumbs={[
                { label: "คอร์สและแบบฝึก", href: "#recipe-form" },
                { label: "คอร์สตัวอย่าง 01" },
              ]}
            />
            <AdminSection title="ข้อมูลคอร์ส">
              <div className="flex max-w-[35rem] flex-col gap-5">
                <TextField label="ชื่อคอร์ส" name="r-title" defaultValue="คอร์สตัวอย่าง 01" />
                <Select
                  label="ระดับความยาก"
                  name="r-level"
                  options={[
                    { value: "1", label: "ระดับ 1" },
                    { value: "2", label: "ระดับ 2" },
                  ]}
                />
                <div>
                  <Button type="submit">บันทึก</Button>
                </div>
              </div>
            </AdminSection>
            <div className="mt-6 [&>div]:static">
              <SaveBar dirty>
                <Button variant="secondary">ยกเลิก</Button>
                <Button>บันทึก</Button>
              </SaveBar>
            </div>
          </Recipe>
        </AdminScope>
      </Example>

      <Example
        title="หน้าภาพรวมของผู้ดูแล"
        importLine='import { AdminSection, PageHeader, StatTile } from "@/shared/ui";'
        note="PageHeader → AdminSection → ตาราง StatTile"
      >
        <AdminScope>
          <Recipe code={overviewCode}>
            <PageHeader title="ภาพรวม" description="สรุปการใช้งานของศูนย์ตัวอย่าง" />
            <AdminSection title="สรุปวันนี้">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3">
                <StatTile
                  icon={<Users {...icon} />}
                  label="ผู้ใช้งาน"
                  value="128"
                  unit="คน"
                  delta={{ text: "เพิ่มขึ้น 6 คน", tone: "up" }}
                />
                <StatTile icon={<Activity {...icon} />} label="ฝึกแล้ววันนี้" value="42" unit="ครั้ง" />
                <StatTile icon={<CalendarDays {...icon} />} label="นัดสัปดาห์นี้" value="17" unit="นัด" />
              </div>
            </AdminSection>
          </Recipe>
        </AdminScope>
      </Example>

      <Example
        title="หน้าจอผู้สูงอายุทีละขั้น"
        importLine='import { Button, ChoiceList, ElderHeader, StepProgress } from "@/shared/ui";'
        note="ElderHeader → StepProgress → หนึ่งคำถาม → ปุ่มหลักหนึ่งปุ่ม"
      >
        <ElderScope>
          <Recipe code={stepCode}>
            <div className="flex flex-col gap-6">
              <ElderHeader title="ตั้งค่าการฝึก" backHref="#recipe-step" />
              <StepProgress current={2} total={4} />
              <ChoiceList
                name="r-step-choice"
                legend="วันนี้อยากฝึกนานแค่ไหน"
                defaultValue="10"
                options={[
                  { value: "5", title: "5 นาที" },
                  { value: "10", title: "10 นาที", description: "เหมาะสำหรับเริ่มต้น" },
                ]}
              />
              <Button fullWidth>ถัดไป</Button>
            </div>
          </Recipe>
        </ElderScope>
      </Example>

      <Example
        title="หน้าระหว่างโหลด"
        importLine='import { AdminSection, PageHeader, Reveal, TableCard, TableSkeleton } from "@/shared/ui";'
        note="หน้ารายการเดิม แต่ส่วนที่อ่านข้อมูลห่อด้วย Reveal และ fallback คือโครงสร้างจากรายการคอลัมน์เดียวกัน ภาพคือสิ่งที่ fallback แสดง"
      >
        <AdminScope>
          <Recipe code={loadingCode}>
            <PageHeader
              title="คอร์สและแบบฝึก"
              breadcrumbs={[{ label: "เนื้อหาและผล" }, { label: "คอร์สและแบบฝึก" }]}
            />
            <AdminSection title="คอร์สทั้งหมด">
              <TableCard>
                <TableSkeleton label="กำลังโหลดรายการคอร์ส" columns={courseColumns} rows={3} />
              </TableCard>
            </AdminSection>
          </Recipe>
        </AdminScope>
      </Example>
    </Part>
  );
}
