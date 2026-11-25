import { EmptyState, PageHeader, Panel } from "@/shared/ui";

export const metadata = { title: "ภาพรวม" };

export default function AdminHomePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="ภาพรวม" description="เลือกเมนูด้านซ้ายเพื่อจัดการส่วนต่าง ๆ ของระบบ" />
      {/* TODO(analytics): replace with the admin dashboard */}
      <Panel>
        <EmptyState
          title="ยังไม่มีข้อมูลสรุป"
          description="ส่วนนี้จะแสดงภาพรวมของระบบเมื่อโมดูลวิเคราะห์ผลพร้อมใช้งาน"
        />
      </Panel>
    </div>
  );
}
