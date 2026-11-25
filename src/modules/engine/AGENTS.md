# Lane: engine — the 3x3 grid, playing patterns, recording results

**Owner:** Supanat (66160239) · `@Pxrch` · Read the root [`AGENTS.md`](../../../AGENTS.md) first.

The part elderly users actually touch. Accuracy of input and timing matters most here.

## You own

| Area        | Paths                                                                                |
| ----------- | ------------------------------------------------------------------------------------ |
| Module code | `src/modules/engine/**`                                                              |
| Schema      | `prisma/schema/engine.prisma`                                                        |
| Routes      | `src/app/(elder)/courses/**`, `src/app/(elder)/play/**`, `src/app/api/engine/**`     |
| Tables      | `training_sessions`, `item_results`, `item_attempts`                                 |
| Contract    | `AttemptTaps` in `contracts.ts`; the `item_results` table shape (analytics reads it) |

## Domain rules already decided (team lead, 2026-11-25)

- Cells are numbered 0–8, row by row from the top-left. Patterns arrive as `PatternSteps`
  (see `@/modules/content/contracts`). A step with two cells is a simultaneous
  two-finger press.
- **Training mode:** show the sequence, highlight the next cell, unlimited retries, a
  wrong tap is never penalised. **Test mode:** no hints, attempts limited by the
  effective `max_attempts`, results feed analytics.
- Use Pointer Events (track each finger by `pointerId`) and `performance.now()`.
  Two taps inside the simultaneity window count as one step (prototype values: 700 ms
  touch, 1500 ms mouse). Store the window used in `training_sessions.simultaneity_window_ms`.
- Response time for an item = end of pattern display → last tap. Also keep
  first-tap latency and inter-tap intervals.
- The browser checks taps for instant feedback, but **the server re-checks every attempt
  against the pattern before saving.** Never trust `isCorrect` from the client.
- When a session starts, copy the effective settings into `training_sessions` and, per
  item, the pattern version and steps into `item_results.expected_steps`.
- Tag each session with `context` (`HOME`/`CENTER`), `center_id`, `device_id`,
  `booking_id` from `getCurrentUser()`. On a center device, training requires an active
  booking — ask the identity/booking APIs, do not re-implement the check.
- Completed `item_results` / `item_attempts` are immutable.
- Feedback is always visual **and** audible, and never colour alone. The grid must not
  move while the user is tapping and must fit one screen at every text size.

## Public API to provide

- `@/modules/engine/ui`: **`<PatternGrid />`** — display and input modes, reused by the
  content lane's Pattern Editor. **First deliverable: content is blocked on it.**
- `index.ts`: `startTrainingSessionAction`, `submitItemAttemptAction`,
  `finishTrainingSessionAction`, `getExerciseProgress(userId)`.
- After a session completes, call analytics' `computeSessionSummary(sessionId)`.

## Depends on

- `content` — `listPublishedCourses()`, `getPlayableExercise()`.
- `identity` — `getCurrentUser()`.
- `analytics` — `computeSessionSummary()`.

## Must be unit-tested

Sequence checking (including two-finger steps and partial credit), grouping raw taps
into steps with the simultaneity window, and timing calculations — all as pure functions.
