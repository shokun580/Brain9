import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/shared/lib/db";
import { env } from "@/shared/lib/env";
import type { CurrentUser } from "../contracts";

/** Name of the HttpOnly cookie that carries the opaque session token. */
export const SESSION_COOKIE = "brain9_session";

/**
 * Who is making this request? Returns null when nobody is signed in.
 *
 * This is the ONLY way other modules learn the current user. It reads a cookie, so the
 * component or action calling it runs at request time (keep it inside <Suspense>).
 * Memoised per request, so calling it many times costs one lookup.
 *
 * TODO(identity): replace the body with the real session lookup
 *   1. sha256(cookie) -> auth_sessions.token_hash, not ended, not expired
 *   2. load the user, reject unless status = ACTIVE
 *   3. resolve context/centerId/deviceId from the session + device token
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    // Real sessions are not implemented yet; an unknown token is treated as signed out.
    return null;
  }
  return devBypassUser();
});

/** For pages: the signed-in user, or a redirect to the login page. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** For admin pages: an ADMIN, or a redirect away. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");
  return user;
}

/**
 * LOCAL DEVELOPMENT ONLY. Signs in as the first seeded user with the role in DEV_AUTH_ROLE.
 * Both conditions must hold, so it can never be active on Vercel (where NODE_ENV is
 * "production" for staging and production builds alike).
 */
async function devBypassUser(): Promise<CurrentUser | null> {
  const { APP_ENV, DEV_AUTH_ROLE } = env();
  if (process.env.NODE_ENV === "production" || APP_ENV !== "local" || !DEV_AUTH_ROLE) {
    return null;
  }
  const user = await db.user.findFirst({
    where: { role: DEV_AUTH_ROLE, status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, firstName: true, lastName: true },
  });
  if (!user) return null;
  return { ...user, context: "HOME", centerId: null, deviceId: null };
}
