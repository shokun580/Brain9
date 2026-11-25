import "server-only";
import { z } from "zod";

/**
 * Server-side environment variables, validated once at first use.
 * Add a variable here (and to .env.example) before reading it anywhere else —
 * never read `process.env` directly in module code.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  /** Which deployment this is. Drives feature gates such as the dev auth bypass. */
  APP_ENV: z.enum(["local", "staging", "production"]).default("local"),
  /**
   * LOCAL ONLY. Signs every request in as the seeded demo ADMIN or USER so modules can be
   * built before the real login exists. Ignored unless APP_ENV=local and NODE_ENV != production.
   */
  DEV_AUTH_ROLE: z.enum(["ADMIN", "USER"]).optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

export function env(): Env {
  if (!cached) {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      const details = parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      throw new Error(`Invalid environment variables — ${details}`);
    }
    cached = parsed.data;
  }
  return cached;
}
