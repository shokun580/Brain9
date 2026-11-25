// Client-safe contracts for the content module. OWNER: Apinan (@shokun580).
// Pure types + Zod schemas only: this file is imported by browser code and by other modules.
import { z } from "zod";
import type { ContentStatus } from "@/generated/prisma/enums";

export const DIFFICULTY_MIN = 1;
export const DIFFICULTY_MAX = 5;
/** Cells of the 3x3 grid are numbered 0–8, row by row from the top-left. */
export const GRID_CELL_COUNT = 9;
export const PATTERN_FORMAT_VERSION = 1;

// ---------------------------------------------------------------------------------------
// PatternSteps — THE contract between content (writes), engine (plays) and analytics.
// Stored in patterns.steps and copied into item_results.expected_steps.
// Changing this shape is a cross-module change: bump PATTERN_FORMAT_VERSION and get
// engine + analytics owners to approve (docs/contracts/pattern-format.md).
// ---------------------------------------------------------------------------------------

export const patternStepSchema = z.object({
  /** One cell = one finger. Two cells = both must be pressed together. */
  cells: z
    .array(
      z
        .number()
        .int()
        .min(0)
        .max(GRID_CELL_COUNT - 1),
    )
    .min(1, "แต่ละจังหวะต้องมีอย่างน้อย 1 ช่อง")
    .max(2, "กดพร้อมกันได้ไม่เกิน 2 ช่อง")
    .refine((cells) => new Set(cells).size === cells.length, "ช่องที่กดพร้อมกันต้องไม่ซ้ำกัน"),
  /** Optional per-step timing overrides, in milliseconds. */
  showMs: z.number().int().positive().optional(),
  gapMs: z.number().int().nonnegative().optional(),
});

export const patternStepsSchema = z.object({
  v: z.literal(PATTERN_FORMAT_VERSION),
  steps: z.array(patternStepSchema).min(2, "Pattern ต้องมีอย่างน้อย 2 จังหวะ").max(20),
});

export type PatternStep = z.infer<typeof patternStepSchema>;
export type PatternSteps = z.infer<typeof patternStepsSchema>;

/** Values derived from the steps and stored next to them for filtering and analytics. */
export function derivePatternStats(pattern: PatternSteps): {
  sequenceLength: number;
  hasSimultaneous: boolean;
} {
  return {
    sequenceLength: pattern.steps.length,
    hasSimultaneous: pattern.steps.some((step) => step.cells.length > 1),
  };
}

// ---------------------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------------------

export const createCourseSchema = z.object({
  title: z.string().trim().min(1, "กรุณากรอกชื่อคอร์ส").max(200, "ชื่อคอร์สยาวได้ไม่เกิน 200 ตัวอักษร"),
  description: z
    .string()
    .trim()
    .max(2000, "คำอธิบายยาวได้ไม่เกิน 2,000 ตัวอักษร")
    .optional()
    .transform((value) => (value ? value : undefined)),
  difficultyLevel: z.coerce
    .number({ message: "กรุณาเลือกระดับความยาก" })
    .int()
    .min(DIFFICULTY_MIN, "ระดับความยากต้องอยู่ระหว่าง 1 ถึง 5")
    .max(DIFFICULTY_MAX, "ระดับความยากต้องอยู่ระหว่าง 1 ถึง 5"),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

/** A course as listed on admin and elderly screens. */
export type CourseSummary = {
  id: string;
  title: string;
  description: string | null;
  difficultyLevel: number;
  status: ContentStatus;
  exerciseCount: number;
};
