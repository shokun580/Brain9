import { describe, expect, it } from "vitest";
import { contentSecurityPolicy, securityHeaders } from "./security-headers";

function directives(policy: string): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const part of policy.split(";")) {
    const [name, ...values] = part.trim().split(/\s+/);
    if (name) map.set(name, values);
  }
  return map;
}

function header(list: ReadonlyArray<{ key: string; value: string }>, key: string) {
  return list.find((item) => item.key.toLowerCase() === key.toLowerCase())?.value;
}

describe("contentSecurityPolicy", () => {
  const deployed = directives(contentSecurityPolicy({ dev: false, deployed: true }));

  it("loads everything from our own origin by default", () => {
    expect(deployed.get("default-src")).toEqual(["'self'"]);
    expect(deployed.get("connect-src")).toEqual(["'self'"]);
    expect(deployed.get("font-src")).toEqual(["'self'"]);
    expect(deployed.get("img-src")).toEqual(["'self'", "data:", "blob:"]);
  });

  it("allows inline scripts and styles, which Next.js emits, but never eval outside dev", () => {
    expect(deployed.get("script-src")).toEqual(["'self'", "'unsafe-inline'"]);
    expect(deployed.get("style-src")).toEqual(["'self'", "'unsafe-inline'"]);
  });

  it("cannot be framed, rebased, or made to post a form elsewhere", () => {
    expect(deployed.get("frame-ancestors")).toEqual(["'none'"]);
    expect(deployed.get("base-uri")).toEqual(["'self'"]);
    expect(deployed.get("form-action")).toEqual(["'self'"]);
    expect(deployed.get("object-src")).toEqual(["'none'"]);
  });

  it("names no other host anywhere", () => {
    const policy = contentSecurityPolicy({ dev: false, deployed: true });
    expect(policy).not.toMatch(/https?:\/\//);
    expect(policy).not.toContain("*");
  });

  it("upgrades insecure requests only on a deployment", () => {
    expect(deployed.has("upgrade-insecure-requests")).toBe(true);
    const local = directives(contentSecurityPolicy({ dev: false, deployed: false }));
    expect(local.has("upgrade-insecure-requests")).toBe(false);
  });

  it("relaxes only what the dev server needs", () => {
    const dev = directives(contentSecurityPolicy({ dev: true, deployed: false }));
    expect(dev.get("script-src")).toEqual(["'self'", "'unsafe-inline'", "'unsafe-eval'"]);
    expect(dev.get("connect-src")).toEqual(["'self'", "ws:"]);
    expect(dev.get("frame-ancestors")).toEqual(["'none'"]);
  });

  it("is one line with no stray whitespace", () => {
    const policy = contentSecurityPolicy({ dev: false, deployed: true });
    expect(policy).not.toMatch(/\n|\s{2,}/);
    expect(policy.endsWith(";")).toBe(false);
  });
});

describe("securityHeaders", () => {
  const list = securityHeaders({ dev: false, deployed: true });

  it("carries the policy and the standard hardening headers", () => {
    expect(header(list, "Content-Security-Policy")).toBe(
      contentSecurityPolicy({ dev: false, deployed: true }),
    );
    expect(header(list, "X-Content-Type-Options")).toBe("nosniff");
    expect(header(list, "X-Frame-Options")).toBe("DENY");
    expect(header(list, "Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(header(list, "Cross-Origin-Opener-Policy")).toBe("same-origin");
  });

  it("switches off the device features Brain9 never uses", () => {
    expect(header(list, "Permissions-Policy")).toBe(
      "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    );
  });

  it("leaves HSTS to the host, so the parent domain's other sites are not affected", () => {
    expect(header(list, "Strict-Transport-Security")).toBeUndefined();
  });

  it("has no duplicate header", () => {
    const keys = list.map((item) => item.key.toLowerCase());
    expect(new Set(keys).size).toBe(keys.length);
  });
});
