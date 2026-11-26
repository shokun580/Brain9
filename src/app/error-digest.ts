/**
 * The server's opaque error id, if the thrown value carries one. Safe to show: it is a hash
 * that only matches the server log, never a message or a stack.
 */
export function errorDigest(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("digest" in error)) return undefined;
  const { digest } = error;
  return typeof digest === "string" && digest !== "" ? digest : undefined;
}
