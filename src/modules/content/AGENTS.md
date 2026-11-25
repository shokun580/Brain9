# Lane: content — courses, exercises, patterns, Pattern Editor

**Owner:** Apinan (66160107) · `@shokun580` · Read the root [`AGENTS.md`](../../../AGENTS.md) first.

Admin-only tools that create the training content the engine plays.

## You own

| Area        | Paths                                                                                                                |
| ----------- | -------------------------------------------------------------------------------------------------------------------- |
| Module code | `src/modules/content/**`                                                                                             |
| Schema      | `prisma/schema/content.prisma`                                                                                       |
| Routes      | `src/app/admin/content/**`, `src/app/api/content/**`                                                                 |
| Tables      | `courses`, `exercises`, `patterns`                                                                                   |
| Contract    | `PatternSteps` in `contracts.ts` and [`docs/contracts/pattern-format.md`](../../../docs/contracts/pattern-format.md) |

This module also holds the project's **reference implementation** (course list + create
course). Keep it exemplary — other lanes copy it.

## Domain rules already decided (team lead, 2026-11-25)

- Hierarchy: Course → Exercise → Pattern. One Pattern is one item ("ข้อ").
- Every published course is open to every elderly user; nothing is locked or assigned.
  Analytics only _recommends_ the next exercise, using `difficulty_level` (1–5).
- Training settings live on the course (`default_max_attempts`, `training_enabled`,
  `test_enabled`, `default_show_ms`, `default_gap_ms`) and can be overridden per exercise
  (NULL = inherit) and per pattern (timing only).
- Server-side validation on every write: a pattern has ≥ 2 steps; an exercise has ≥ 1
  item; a course can be PUBLISHED only with ≥ 1 published exercise.
- Results reference patterns, so content is **soft-deleted** (`deleted_at`) and every
  pattern edit increments `patterns.version`. The engine snapshots the steps it played.
- On save, recompute `sequence_length` and `has_simultaneous` with `derivePatternStats()`.
- All writes are ADMIN-only Server Actions and call `recordAudit()`.

## Public API to provide (`index.ts`)

- `listPublishedCourses()` ✅, `listCoursesForAdmin()` ✅
- `getCourseWithExercises(courseId)`
- `getPlayableExercise(exerciseId)` — patterns in order + effective settings (overrides
  resolved) for the engine
- `listExercisesByDifficulty(level)` — for analytics recommendations

## Depends on

- `identity` — `getCurrentUser()`, `recordAudit()`.
- `engine` — `<PatternGrid />` from `@/modules/engine/ui` for the Pattern Editor and its
  preview. Until it exists, build the editor against the agreed props in the
  cross-module issue.

## Suggested order

1. Course CRUD (edit, publish/archive, soft delete, reorder)
2. Exercise CRUD + settings overrides
3. Pattern Editor (click cells in order, mark two-finger steps, timing, preview)
4. `getPlayableExercise()` for the engine
