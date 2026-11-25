"use client";

import { useActionState } from "react";
import { Button, TextField } from "@/shared/ui";
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
      <TextField
        label="คำอธิบาย (ไม่บังคับ)"
        name="description"
        maxLength={2000}
        errors={fieldErrors?.description}
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="field-difficultyLevel" className="font-bold">
          ระดับความยาก
        </label>
        <select
          id="field-difficultyLevel"
          name="difficultyLevel"
          defaultValue={DIFFICULTY_MIN}
          className="min-h-16 rounded-card border-2 border-border-strong bg-surface px-4 text-lg"
        >
          {levels.map((level) => (
            <option key={level} value={level}>
              ระดับ {level}
            </option>
          ))}
        </select>
        {fieldErrors?.difficultyLevel ? (
          <p role="alert" className="font-bold text-danger">
            ✕ {fieldErrors.difficultyLevel.join(" ")}
          </p>
        ) : null}
      </div>

      {state && !state.ok && !state.fieldErrors ? (
        <p role="alert" className="rounded-card bg-danger-soft p-4 font-bold text-danger">
          ✕ {state.message}
        </p>
      ) : null}
      {state?.ok ? (
        <p role="status" className="rounded-card bg-success-soft p-4 font-bold text-success">
          ✓ สร้างคอร์สเรียบร้อยแล้ว
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "กำลังบันทึก…" : "สร้างคอร์ส"}
      </Button>
    </form>
  );
}
