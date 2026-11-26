import { EmptyState, StatusDot, Table, TBody, Td, Th, THead, Tr } from "@/shared/ui";
import { requireAdmin } from "@/modules/identity";
import { listCoursesForAdmin } from "../server/course-queries";
import { courseColumns } from "./course-columns";
import { courseStatusDisplay } from "./course-status";

/**
 * Async Server Component: authorizes, then reads the database at request time.
 * Render it inside <Suspense> (see app/admin/content/courses/page.tsx).
 */
export async function CourseList() {
  await requireAdmin();
  const courses = await listCoursesForAdmin();

  if (courses.length === 0) {
    return <EmptyState title="ยังไม่มีคอร์ส" description="เริ่มสร้างคอร์สแรกได้จากแบบฟอร์มด้านล่าง" />;
  }

  return (
    <Table aria-label="รายการคอร์ส">
      <THead>
        <Tr>
          {courseColumns.map((column) => (
            <Th key={column.label} numeric={column.numeric}>
              {column.label}
            </Th>
          ))}
        </Tr>
      </THead>
      <TBody>
        {courses.map((course) => {
          const status = courseStatusDisplay(course.status);
          return (
            <Tr key={course.id}>
              <Td primary>
                {course.title}
                {course.description ? (
                  <span className="mt-0.5 block text-small font-normal text-fg-muted">
                    {course.description}
                  </span>
                ) : null}
              </Td>
              <Td>ระดับ {course.difficultyLevel}</Td>
              <Td numeric>{course.exerciseCount}</Td>
              <Td>
                <StatusDot tone={status.tone}>{status.label}</StatusDot>
              </Td>
            </Tr>
          );
        })}
      </TBody>
    </Table>
  );
}
