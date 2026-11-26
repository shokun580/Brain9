/** `/design` is a working reference for the team: on while building, gone in production. */
export function isDesignPageEnabled(appEnv: "local" | "staging" | "production"): boolean {
  return appEnv !== "production";
}
