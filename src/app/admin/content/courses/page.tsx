import { Suspense } from "react";
import { CourseList, CreateCourseForm } from "@/modules/content/ui";
import { AdminSection, PageHeader, TableCard } from "@/shared/ui";

export const metadata = { title: "คอร์สและแบบฝึก" };

/**
 * Reference page for the project. A route file stays thin:
 *   - no database or session access here
 *   - compose components exported from a module's `ui` entry point
 *   - wrap every component that reads data in <Suspense> with a fallback
 */
export default function AdminCoursesPage() {
  return (
    <>
      <PageHeader
        title="คอร์สและแบบฝึก"
        breadcrumbs={[{ label: "เนื้อหาและผล" }, { label: "คอร์สและแบบฝึก" }]}
        description="ดูคอร์สทั้งหมดและสร้างคอร์สใหม่"
      />

      <AdminSection title="คอร์สทั้งหมด">
        <TableCard>
          <Suspense fallback={<p className="p-4 text-body text-fg-2">กำลังโหลดรายการคอร์ส…</p>}>
            <CourseList />
          </Suspense>
        </TableCard>
      </AdminSection>

      <AdminSection title="สร้างคอร์สใหม่">
        <CreateCourseForm />
      </AdminSection>
    </>
  );
}
