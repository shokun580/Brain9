import { AdminSection, EmptyState, PageHeader } from "@/shared/ui";

export const metadata = { title: "ภาพรวม" };

export default function AdminHomePage() {
  return (
    <>
      <PageHeader title="ภาพรวม" description="เลือกเมนูด้านซ้ายเพื่อจัดการส่วนต่าง ๆ ของระบบ" />
      <AdminSection title="สรุปวันนี้">
        {/* TODO(analytics): replace with the admin dashboard */}
        <EmptyState
          title="ยังไม่มีข้อมูลสรุป"
          description="ส่วนนี้จะแสดงภาพรวมของระบบเมื่อโมดูลวิเคราะห์ผลพร้อมใช้งาน"
        />
      </AdminSection>
    </>
  );
}
