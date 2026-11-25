import { requireAdmin } from "@/modules/identity";
import { Card } from "@/shared/ui";
import type { CourseSummary } from "../contracts";
import { listCoursesForAdmin } from "../server/course-queries";

const statusLabel: Record<CourseSummary["status"], string> = {
  DRAFT: "ฉบับร่าง",
  PUBLISHED: "เปิดใช้งาน",
  ARCHIVED: "เก็บถาวร",
};

/**
 * Async Server Component: authorizes, then reads the database at request time.
 * Render it inside <Suspense> (see app/admin/content/courses/page.tsx).
 */
export async function CourseList() {
  await requireAdmin();
  const courses = await listCoursesForAdmin();

  if (courses.length === 0) {
    return <p className="text-text-2">ยังไม่มีคอร์ส เริ่มสร้างคอร์สแรกได้จากแบบฟอร์มด้านล่าง</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {courses.map((course) => (
        <li key={course.id}>
          <Card>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-xl font-bold">{course.title}</h3>
              <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-bold text-primary">
                {statusLabel[course.status]}
              </span>
            </div>
            {course.description ? <p className="mt-1 text-text-2">{course.description}</p> : null}
            <p className="mt-2 text-sm text-text-2">
              ระดับความยาก {course.difficultyLevel} · {course.exerciseCount} แบบฝึก
            </p>
          </Card>
        </li>
      ))}
    </ul>
  );
}
