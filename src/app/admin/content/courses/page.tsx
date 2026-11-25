import { Suspense } from "react";
import { CourseList, CreateCourseForm } from "@/modules/content/ui";
import { PageHeader, Panel } from "@/shared/ui";

export const metadata = { title: "คอร์สและแบบฝึก" };

/**
 * Reference page for the project. A route file stays thin:
 *   - no database or session access here
 *   - compose components exported from a module's `ui` entry point
 *   - wrap every component that reads data in <Suspense> with a fallback
 */
export default function AdminCoursesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="คอร์สและแบบฝึก"
        breadcrumbs={[{ label: "เนื้อหาและผล" }, { label: "คอร์สและแบบฝึก" }]}
        description="ดูคอร์สทั้งหมดและสร้างคอร์สใหม่"
      />

      <Panel title="คอร์สทั้งหมด" padded={false}>
        <Suspense fallback={<p className="p-4 text-body text-fg-2">กำลังโหลดรายการคอร์ส…</p>}>
          <CourseList />
        </Suspense>
      </Panel>

      <Panel title="สร้างคอร์สใหม่">
        <CreateCourseForm />
      </Panel>
    </div>
  );
}
