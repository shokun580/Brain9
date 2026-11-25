# Contract: module APIs

What each module promises to the others. A line marked ✅ exists today; the rest is the
agreed target. Signatures are settled in cross-module issues and updated here by the
owner when they land.

All Server Actions return `ActionResult<T>` from `@/shared/lib/action-result`.

## identity → everyone

| Export                                           | Status        | Used for                                                         |
| ------------------------------------------------ | ------------- | ---------------------------------------------------------------- |
| `getCurrentUser(): Promise<CurrentUser \| null>` | ✅ (dev stub) | Authorize every query and action                                 |
| `requireUser()`, `requireAdmin()`                | ✅            | Pages that need a signed-in user / admin                         |
| `recordAudit(entry)`                             | ✅            | Admin changes, access to other people's data                     |
| `CurrentUser` type                               | ✅            | `{ id, role, firstName, lastName, context, centerId, deviceId }` |
| `hasActiveConsent(userId, purpose)`              | planned       | analytics skips users who withdrew `COGNITIVE_DATA`              |
| `getUserDisplay(userIds)`                        | planned       | Names for admin lists in other modules (audited)                 |

## booking → identity, engine

| Export                                     | Status  | Used for                                 |
| ------------------------------------------ | ------- | ---------------------------------------- |
| `getActiveBookingForNow(userId, centerId)` | planned | Center-device login and "may train now?" |
| `checkInBooking(bookingId, deviceId)`      | planned | Mark arrival at login on a center device |

## content → engine, analytics

| Export                               | Status  | Used for                                                    |
| ------------------------------------ | ------- | ----------------------------------------------------------- |
| `listPublishedCourses()`             | ✅      | Course list for elderly users                               |
| `listCoursesForAdmin()`              | ✅      | Admin course list                                           |
| `getCourseWithExercises(courseId)`   | planned | Exercise list                                               |
| `getPlayableExercise(exerciseId)`    | planned | Patterns in order + effective settings (overrides resolved) |
| `listExercisesByDifficulty(level)`   | planned | Recommendations                                             |
| `PatternSteps`, `patternStepsSchema` | ✅      | See [`pattern-format.md`](pattern-format.md)                |

## engine → content, analytics

| Export                                     | Status                       | Used for                                                                                       |
| ------------------------------------------ | ---------------------------- | ---------------------------------------------------------------------------------------------- |
| `<PatternGrid />` (`@/modules/engine/ui`)  | planned — **first priority** | Pattern Editor and its preview                                                                 |
| `getExerciseProgress(userId)`              | planned                      | "Done / not done" on lists                                                                     |
| `item_results`, `training_sessions` tables | ✅ schema                    | analytics reads them directly through `db` (read-only) — the one allowed cross-lane table read |

## analytics → engine, elderly screens, admin

| Export                               | Status  | Used for                                              |
| ------------------------------------ | ------- | ----------------------------------------------------- |
| `computeSessionSummary(sessionId)`   | planned | Called by engine when a session completes; idempotent |
| `getCurrentPerformanceLevel(userId)` | planned | Result screen                                         |
| `getActiveRecommendation(userId)`    | planned | "Try this next"                                       |
| `getUserMetrics(userId, range)`      | planned | Charts                                                |
