/**
 * The security headers every response carries. OWNER: infra.
 *
 * Pure and dependency-free on purpose: `next.config.ts` imports it, and the config file is
 * loaded before the app's own module graph exists.
 *
 * Why this policy and not a stricter one: `docs/security.md`. In short, a nonce-based
 * Content Security Policy needs every page rendered on demand and is incompatible with
 * Partial Prerendering, so inline scripts and styles stay allowed (Next.js emits them) and
 * everything else is locked to our own origin.
 */
export type SecurityHeaderOptions = {
  /** The dev server: it needs `eval` and a WebSocket for hot reloading. */
  dev: boolean;
  /** Staging or production, always served over HTTPS. False for a local build. */
  deployed: boolean;
};

export type ResponseHeader = { key: string; value: string };

export function contentSecurityPolicy({ dev, deployed }: SecurityHeaderOptions): string {
  const directives: string[] = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${dev ? " ws:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  // On plain http://localhost this directive would rewrite every asset request to https.
  if (deployed) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

/**
 * HSTS is absent on purpose: the host (Vercel) sends it for this hostname, and setting
 * `includeSubDomains` here would reach the parent domain's other sites.
 */
export function securityHeaders(options: SecurityHeaderOptions): ResponseHeader[] {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy(options) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    // For browsers that predate `frame-ancestors`.
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    },
  ];
}
