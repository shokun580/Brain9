"use server";

import { refresh } from "next/cache";
import { getCurrentUser, recordAudit } from "@/modules/identity";
import { fail, failFromZod, ok, type ActionResult } from "@/shared/lib/action-result";
import { db } from "@/shared/lib/db";
import { createCourseSchema } from "../contracts";

export type CreateCourseState = ActionResult<{ id: string }> | null;

/**
 * Creates a course as a DRAFT.
 *
 * This is the reference Server Action for the project. Every action follows these steps
 * in this order:
 *   1. authorize  — re-read the current user inside the action; never trust the page
 *   2. validate   — parse FormData with the Zod schema from contracts.ts
 *   3. write      — one db call (or one transaction)
 *   4. audit      — record admin changes
 *   5. refresh    — re-render the current page with fresh data
 *   6. return     — an ActionResult; never throw for expected failures
 */
export async function createCourseAction(
  _previous: CreateCourseState,
  formData: FormData,
): Promise<CreateCourseState> {
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", "กรุณาเข้าสู่ระบบก่อน");
  if (user.role !== "ADMIN") return fail("FORBIDDEN", "เฉพาะผู้ดูแลเท่านั้นที่สร้างคอร์สได้");

  const parsed = createCourseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    difficultyLevel: formData.get("difficultyLevel"),
  });
  if (!parsed.success) return failFromZod(parsed.error);

  const course = await db.course.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      difficultyLevel: parsed.data.difficultyLevel,
      createdById: user.id,
    },
    select: { id: true },
  });

  await recordAudit({
    actorId: user.id,
    action: "course.create",
    entityType: "course",
    entityId: course.id,
  });

  refresh();
  return ok({ id: course.id });
}
