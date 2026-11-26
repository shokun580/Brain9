import { CourseList, CourseListSkeleton, CreateCourseForm } from "@/modules/content/ui";
import { AdminSection, PageHeader, Reveal, TableCard } from "@/shared/ui";

export const metadata = { title: "คอร์สและแบบฝึก" };

/**
 * Reference page for the project. A route file stays thin:
 *   - no database or session access here
 *   - compose components exported from a module's `ui` entry point
 *   - wrap every component that reads data in <Suspense> (here <Reveal>) with a fallback
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
        <Reveal fallback={<CourseListSkeleton />}>
          <TableCard>
            <CourseList />
          </TableCard>
        </Reveal>
      </AdminSection>

      <AdminSection title="สร้างคอร์สใหม่">
        <CreateCourseForm />
      </AdminSection>
    </>
  );
}
