import type { ZodError } from "zod";

/**
 * The one return shape for every Server Action and for service functions that can fail
 * for reasons the user should see. Never throw for expected failures (validation,
 * permission, conflicts) — return `fail(...)` so the UI can show a friendly Thai message.
 */
export type ActionErrorCode =
  | "VALIDATION" // input did not pass the Zod schema
  | "UNAUTHENTICATED" // not signed in
  | "FORBIDDEN" // signed in but not allowed
  | "NOT_FOUND"
  | "CONFLICT" // e.g. slot full, duplicate phone
  | "INTERNAL";

export type FieldErrors = Record<string, string[]>;

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; code: ActionErrorCode; message: string; fieldErrors?: FieldErrors };

export function ok(): ActionResult<void>;
export function ok<T>(data: T): ActionResult<T>;
export function ok<T>(data?: T): ActionResult<T | void> {
  return { ok: true, data };
}

export function fail(
  code: ActionErrorCode,
  message: string,
  fieldErrors?: FieldErrors,
): { ok: false; code: ActionErrorCode; message: string; fieldErrors?: FieldErrors } {
  return fieldErrors ? { ok: false, code, message, fieldErrors } : { ok: false, code, message };
}

/** Turns a ZodError into a VALIDATION failure with per-field messages. */
export function failFromZod(error: ZodError, message = "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง") {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "_form";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fail("VALIDATION", message, fieldErrors);
}
