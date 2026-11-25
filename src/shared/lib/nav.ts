/** Paths that only match themselves: their children belong to another navigation area. */
const EXACT_ONLY = new Set(["/", "/admin"]);

function trimTrailingSlash(path: string): string {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

/**
 * True when `pathname` is `href` or one of its child segments (`/courses/abc` for `/courses`).
 * `/` and `/admin` match exactly only. A trailing slash is ignored; an empty value never matches.
 */
export function isActivePath(pathname: string, href: string): boolean {
  if (!pathname || !href) return false;
  const path = trimTrailingSlash(pathname);
  const target = trimTrailingSlash(href);
  if (path === target) return true;
  if (EXACT_ONLY.has(target)) return false;
  return path.startsWith(`${target}/`);
}
