import { Check, Pencil } from "lucide-react";
import { Select, StatusDot, Tag, TextField } from "@/shared/ui";
import { CourseTable } from "../CourseTable";
import { AdminScope, SubHeading } from "../chrome";
import { Example } from "../Example";

const filters = (
  <>
    <div className="w-56">
      <TextField label="ค้นหาคอร์ส" name="a-table-search" placeholder="พิมพ์ชื่อคอร์ส" />
    </div>
    <div className="w-44">
      <Select
        label="สถานะ"
        name="a-table-status"
        options={[
          { value: "all", label: "ทั้งหมด" },
          { value: "ok", label: "เปิดใช้งาน" },
          { value: "draft", label: "ฉบับร่าง" },
        ]}
      />
    </div>
  </>
);

const tagIcon = { "aria-hidden": true, strokeWidth: 1.9, className: "size-icon-sm" } as const;

export function AdminTables() {
  return (
    <>
      <SubHeading>ตาราง</SubHeading>

      <Example
        title="TableCard, Table, RowActions, Pagination"
        importLine='import { Pagination, RowActions, StatusDot, Table, TableCard, Tag, TBody, Td, Th, THead, Tr } from "@/shared/ui";'
        note="ตารางอยู่ในการ์ดเส้นบาง ๆ มีตัวกรองด้านบนและ Pagination ด้านล่าง คอลัมน์ตัวเลขชิดขวา (numeric) เซลล์หลักใช้ primary คอลัมน์สุดท้ายคือ RowActions ทุกแถว: ลิงก์หลักหนึ่งอัน กับเมนู ⋯ ที่เปิดเป็น popover เลื่อนลงไปแถวล่าง ๆ แล้วลองกดเมนู เมนูจะพลิกขึ้นบนเอง"
      >
        <AdminScope>
          <CourseTable label="คอร์สตัวอย่าง" toolbar={filters} />
        </AdminScope>
      </Example>

      <Example
        title="StatusDot, Tag"
        importLine='import { StatusDot, Tag } from "@/shared/ui";'
        note="StatusDot คือสถานะ (จุดและคำ) Tag คือคุณสมบัติของแถว เช่น โหมด หรือการตั้งค่า ไม่ใช่สถานะ"
      >
        <AdminScope>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <StatusDot tone="ok">เปิดใช้งาน</StatusDot>
              <StatusDot tone="draft">ฉบับร่าง</StatusDot>
              <StatusDot tone="off">ปิดอยู่</StatusDot>
              <StatusDot tone="danger">มีปัญหา</StatusDot>
            </div>
            <div className="flex flex-wrap gap-2">
              <Tag>ทั่วไป</Tag>
              <Tag tone="primary" icon={<Check {...tagIcon} />}>
                แนะนำ
              </Tag>
              <Tag tone="attention" icon={<Pencil {...tagIcon} />}>
                แก้ไขอยู่
              </Tag>
            </div>
          </div>
        </AdminScope>
      </Example>
    </>
  );
}
