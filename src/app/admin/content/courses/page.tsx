import { Suspense } from "react";
import { CourseList, CreateCourseForm } from "@/modules/content/ui";
import { Card } from "@/shared/ui";

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
      <h1 className="text-2xl font-extrabold">จัดการคอร์ส</h1>

      <section aria-labelledby="course-list-heading" className="flex flex-col gap-3">
        <h2 id="course-list-heading" className="text-xl font-bold">
          คอร์สทั้งหมด
        </h2>
        <Suspense fallback={<p className="text-text-2">กำลังโหลดรายการคอร์ส…</p>}>
          <CourseList />
        </Suspense>
      </section>

      <section aria-labelledby="course-create-heading">
        <Card className="flex flex-col gap-4">
          <h2 id="course-create-heading" className="text-xl font-bold">
            สร้างคอร์สใหม่
          </h2>
          <CreateCourseForm />
        </Card>
      </section>
    </div>
  );
}
