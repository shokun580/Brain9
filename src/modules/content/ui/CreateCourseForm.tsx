"use client";

import { useActionState } from "react";
import { Button, Notice, Select, TextField, Textarea } from "@/shared/ui";
import { DIFFICULTY_MAX, DIFFICULTY_MIN } from "../contracts";
import { createCourseAction, type CreateCourseState } from "../server/course-actions";

const levels = Array.from(
  { length: DIFFICULTY_MAX - DIFFICULTY_MIN + 1 },
  (_, index) => DIFFICULTY_MIN + index,
);

export function CreateCourseForm() {
  const [state, formAction, pending] = useActionState<CreateCourseState, FormData>(
    createCourseAction,
    null,
  );
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <TextField label="ชื่อคอร์ส" name="title" required maxLength={200} errors={fieldErrors?.title} />
      <Textarea
        label="คำอธิบาย (ไม่บังคับ)"
        name="description"
        maxLength={2000}
        errors={fieldErrors?.description}
      />

      <Select
        label="ระดับความยาก"
        name="difficultyLevel"
        defaultValue={DIFFICULTY_MIN}
        options={levels.map((level) => ({ value: String(level), label: `ระดับ ${level}` }))}
        errors={fieldErrors?.difficultyLevel}
      />

      {state && !state.ok && !state.fieldErrors ? (
        <Notice tone="danger">{state.message}</Notice>
      ) : null}
      {state?.ok ? <Notice tone="success">สร้างคอร์สเรียบร้อยแล้ว</Notice> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "กำลังบันทึก…" : "สร้างคอร์ส"}
        </Button>
      </div>
    </form>
  );
}
