import { ClipboardCheck, Dumbbell } from "lucide-react";
import type { ReactNode } from "react";
import {
  Pagination,
  RowActions,
  StatusDot,
  Table,
  TableCard,
  Tag,
  TBody,
  Td,
  Th,
  THead,
  Tr,
} from "@/shared/ui";
import { courseColumns, fakeCourses } from "./fake-courses";

const tagIcon = { "aria-hidden": true, strokeWidth: 1.9, className: "size-icon-sm" } as const;

/**
 * The sample list page's table: toolbar, header, rows with a `RowActions` column and a pager.
 * `rows` picks how many of the 12 made-up courses to show; `toolbar` is the filter slot.
 */
export function CourseTable({
  rows = fakeCourses.length,
  toolbar,
  label,
}: {
  rows?: number;
  toolbar?: ReactNode;
  label: string;
}) {
  const shown = fakeCourses.slice(0, rows);
  return (
    <TableCard
      toolbar={toolbar}
      footer={<Pagination page={2} pageSize={shown.length} total={48} hrefFor={() => "#admin"} />}
    >
      <Table aria-label={label}>
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
          {shown.map((course) => (
            <Tr key={course.title}>
              <Td primary>{course.title}</Td>
              <Td>
                <Tag
                  tone={course.mode === "ทดสอบ" ? "attention" : "neutral"}
                  icon={
                    course.mode === "ทดสอบ" ? (
                      <ClipboardCheck {...tagIcon} />
                    ) : (
                      <Dumbbell {...tagIcon} />
                    )
                  }
                >
                  {course.mode}
                </Tag>
              </Td>
              <Td numeric>{course.exercises}</Td>
              <Td>
                <StatusDot tone={course.status.tone}>{course.status.label}</StatusDot>
              </Td>
              <Td>
                <RowActions
                  primary={{ label: "แก้ไข", href: "/admin/content/courses" }}
                  more={[
                    { label: "ดูตัวอย่าง", href: "/admin" },
                    { label: "ทำสำเนา", href: "/admin/users" },
                  ]}
                  rowLabel={course.title}
                />
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </TableCard>
  );
}
