import { AdminPageSkeleton, StatTileSkeleton, TableCard, TableSkeleton } from "@/shared/ui";
import { AdminScope, SubHeading } from "../chrome";
import { courseColumns } from "../fake-courses";
import { Example } from "../Example";

export function AdminLoading() {
  return (
    <>
      <SubHeading>ระหว่างโหลดข้อมูล</SubHeading>

      <Example
        title="TableSkeleton"
        importLine='import { TableCard, TableSkeleton } from "@/shared/ui";'
        note="หัวตารางจริงปรากฏทันที แถวเป็นแถบสีเทา สร้างจากรายการคอลัมน์เดียวกับตารางจริง จึงไม่คลาดเคลื่อน"
      >
        <AdminScope>
          <TableCard>
            <TableSkeleton label="กำลังโหลดรายการคอร์ส" columns={courseColumns} rows={3} lines={2} />
          </TableCard>
        </AdminScope>
      </Example>

      <Example
        title="StatTileSkeleton"
        importLine='import { StatTileSkeleton } from "@/shared/ui";'
        note="กล่องเดียวกับ StatTile"
      >
        <AdminScope>
          <StatTileSkeleton label="กำลังโหลดตัวเลขสรุป" count={3} />
        </AdminScope>
      </Example>

      <Example
        title="AdminPageSkeleton"
        importLine='import { AdminPageSkeleton } from "@/shared/ui";'
        note="โครงของทั้งหน้าผู้ดูแล ใช้เป็น fallback ใน layout"
      >
        <AdminScope>
          <AdminPageSkeleton />
        </AdminScope>
      </Example>

      <Example title="Reveal" importLine='import { Reveal } from "@/shared/ui";'>
        <AdminScope>
          <p className="text-body text-fg-2">
            ห่อส่วนที่ต้องรอข้อมูลด้วย Reveal และส่งโครงสีเทาเป็น fallback เมื่อข้อมูลมา
            โครงจะจางหายและเนื้อหาจางเข้ามาใน 0.3 วินาที
          </p>
          <p className="mt-2 text-body text-fg-2">
            ตัวอย่างสดแสดงไม่ได้โดยไม่ทำให้รอเปล่า ดูการใช้งานจริงที่หน้า /admin/content/courses และโค้ดในหัวข้อ
            “แบบหน้าจอที่อนุมัติ”
          </p>
        </AdminScope>
      </Example>
    </>
  );
}
