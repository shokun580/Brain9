import { Suspense } from "react";
import { CourseList, CreateCourseForm } from "@/modules/content/ui";

export const metadata = { title: "จัดการคอร์ส" };

/**
 * Reference page for the project. A route file stays thin:
 *   - no database or session access here
 *   - compose components exported from a module's `ui` entry point
 *   - wrap every component that reads data in <Suspense> with a fallback
 */
export default function AdminCoursesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-title font-bold">จัดการคอร์ส</h1>

      <section aria-labelledby="course-list-heading" className="flex flex-col gap-3">
        <h2 id="course-list-heading" className="text-heading font-bold">
          คอร์สทั้งหมด
        </h2>
        <Suspense fallback={<p className="text-body text-fg-2">กำลังโหลดรายการคอร์ส…</p>}>
          <CourseList />
        </Suspense>
      </section>

      <section aria-labelledby="course-create-heading">
        <div className="flex flex-col gap-4 rounded-panel border border-line bg-surface p-5">
          <h2 id="course-create-heading" className="text-heading font-bold">
            สร้างคอร์สใหม่
          </h2>
          <CreateCourseForm />
        </div>
      </section>
    </div>
  );
}
