import type { NextConfig } from "next";
import { securityHeaders } from "./src/shared/lib/security-headers";

// `APP_ENV` is read straight from the environment here: `env()` validates the database
// URL too, which a config file loaded by every tool must not require.
const deployed = process.env.APP_ENV === "staging" || process.env.APP_ENV === "production";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders({ dev: process.env.NODE_ENV === "development", deployed }),
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
