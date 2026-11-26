# Lane: analytics — metrics, trends, performance level, recommendations

**Owner:** Saruta (66160375) · `@ptxsm` · Read the root [`AGENTS.md`](../../../AGENTS.md) first.

Turns recorded results into something an elderly user and an admin can understand.

## You own

| Area        | Paths                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| Module code | `src/modules/analytics/**`                                                                                               |
| Schema      | `prisma/schema/analytics.prisma`                                                                                         |
| Routes      | `src/app/(elder)/results/**`, `src/app/admin/analytics/**`, `src/app/api/analytics/**`                                   |
| Tables      | `session_summaries`, `performance_level_criteria`, `user_performance_levels`, `user_metric_snapshots`, `recommendations` |

## Domain rules already decided (team lead, 2026-11-25)

- **Read-only towards other lanes.** Analytics reads `item_results`, `training_sessions`
  and content tables, and writes only its own tables. Everything it stores can be
  recomputed from `item_results` — by updating rows in place or soft-deleting them, never
  by deleting and re-inserting. `item_results` has no `deleted_at`: join
  `training_sessions` and skip sessions that are soft-deleted.
- Metrics (SRS §8): Accuracy, Response Time, Attempts, Difficulty Level, Progress Trend,
  Performance Level. **Test-mode** sessions are the primary source; training-mode data is
  shown separately and never mixed into the level.
- Performance Level has 4 levels. Thresholds live in `performance_level_criteria` so they
  can be tuned without a deploy. The seeded values are placeholders — set the real ones
  with the Requirement Owner. `user_performance_levels` keeps history; exactly one row per
  (user, difficulty) that is not soft-deleted has `is_current = true` (partial unique index).
- Progress Trend = moving average + slope over time, compared with the previous period
  (prototype: last 3 sessions vs the 3 before). Report `INSUFFICIENT_DATA` rather than
  guessing from too few sessions.
- Recommendation: from the current level and the exercise difficulties in the content
  lane, suggest a harder, same, or easier exercise. Courses are never locked.
- An elderly user sees only their own results; ADMIN sees everyone, and each such view
  calls `recordAudit()`. If the user withdrew `COGNITIVE_DATA` consent, do not compute or
  show analytics for them.
- Charts use Recharts (already installed), must have a text alternative (a table or a
  sentence), large labels, and must not rely on colour alone. Wording follows the voice in
  `docs/design-system.md` section 10.

## Public API to provide (`index.ts`)

- `computeSessionSummary(sessionId)` — idempotent; called by the engine when a session ends
- `getUserMetrics(userId, range)`, `getCurrentPerformanceLevel(userId)`,
  `getActiveRecommendation(userId)`
- `getOverview(filters)` — admin dashboard

## Depends on

- `engine` — the `item_results` / `training_sessions` shape. A change there is a
  cross-module change you must approve.
- `content` — `listExercisesByDifficulty()`.
- `identity` — `getCurrentUser()`, `requireAdmin()`, `recordAudit()`.

## Must be unit-tested

Every metric formula, the trend calculation, level classification and the recommendation
rule, as pure functions checked against hand-calculated examples.
