import { connection } from "next/server";
import { db } from "@/shared/lib/db";
import { env } from "@/shared/lib/env";

/**
 * Liveness + database check used after every deploy. OWNER: infra.
 * Returns no secrets and no personal data.
 */
export async function GET() {
  // Run at request time (never prerender a health check).
  await connection();
  const startedAt = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({
      status: "ok",
      env: env().APP_ENV,
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      dbLatencyMs: Date.now() - startedAt,
    });
  } catch {
    return Response.json({ status: "error", reason: "database_unreachable" }, { status: 503 });
  }
}
