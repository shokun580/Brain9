/**
 * content — public server API. OWNER: Apinan (@shokun580).
 *
 * Read functions other modules call (engine lists courses, analytics reads difficulty).
 * Planned additions: getExerciseWithPatterns(exerciseId), getPlayableExercise(exerciseId),
 * listExercisesByDifficulty(level) for recommendations.
 */
export type { CourseSummary, CreateCourseInput, PatternStep, PatternSteps } from "./contracts";
export { listCoursesForAdmin, listPublishedCourses } from "./server/course-queries";
