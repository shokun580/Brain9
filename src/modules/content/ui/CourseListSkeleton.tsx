import { TableCard, TableSkeleton } from "@/shared/ui";
import { courseColumns } from "./course-columns";

/** Loading state of `CourseList`: the same card and header labels, grey bars for the rows. */
export function CourseListSkeleton() {
  return (
    <TableCard>
      <TableSkeleton label="กำลังโหลดรายการคอร์ส" columns={courseColumns} lines={2} />
    </TableCard>
  );
}
