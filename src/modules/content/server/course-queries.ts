import "server-only";
import { db } from "@/shared/lib/db";
import { notDeleted } from "@/shared/lib/soft-delete";
import type { CourseSummary } from "../contracts";

const courseSummarySelect = {
  id: true,
  title: true,
  description: true,
  difficultyLevel: true,
  status: true,
  _count: { select: { exercises: { where: notDeleted } } },
} as const;

type CourseRow = {
  id: string;
  title: string;
  description: string | null;
  difficultyLevel: number;
  status: CourseSummary["status"];
  _count: { exercises: number };
};

function toSummary(row: CourseRow): CourseSummary {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    difficultyLevel: row.difficultyLevel,
    status: row.status,
    exerciseCount: row._count.exercises,
  };
}

/** Every course that is not deleted, for the admin screens. Caller must be an ADMIN. */
export async function listCoursesForAdmin(): Promise<CourseSummary[]> {
  const rows = await db.course.findMany({
    where: notDeleted,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: courseSummarySelect,
  });
  return rows.map(toSummary);
}

/** Courses elderly users can see: published and not deleted, easiest first. */
export async function listPublishedCourses(): Promise<CourseSummary[]> {
  const rows = await db.course.findMany({
    where: { ...notDeleted, status: "PUBLISHED" },
    orderBy: [{ sortOrder: "asc" }, { difficultyLevel: "asc" }],
    select: courseSummarySelect,
  });
  return rows.map(toSummary);
}
