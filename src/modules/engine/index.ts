/**
 * engine — public server API. OWNER: Supanat (@Pxrch).
 *
 * Nothing is implemented yet. Expected exports (see docs/contracts/module-apis.md):
 *   - startTrainingSession / submitItemAttempt / finishTrainingSession (ActionResult)
 *   - getExerciseProgress(userId)   -> "how much is done" on the course list
 *   - onSessionCompleted hook point -> analytics computes its summary from item_results
 *
 * UI entry point (`@/modules/engine/ui`, to be created): <PatternGrid />, the 3x3 grid
 * that the content module's Pattern Editor reuses. It is the first cross-module
 * deliverable — content is blocked on it.
 */
export {};
