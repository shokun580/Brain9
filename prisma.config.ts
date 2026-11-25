// Prisma 7 configuration. The CLI does NOT auto-load .env files, so we load them here.
// Local development reads .env.local first (same file Next.js uses), then .env.
// Deploy workflows set BRAIN9_ENV_FILE to the file written by `vercel pull`.
// Variables already present in the environment always win; among files, the first wins.
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

const envFiles = [process.env.BRAIN9_ENV_FILE, ".env.local", ".env"].filter(
  (file): file is string => Boolean(file),
);
loadEnv({ path: envFiles, quiet: true });

export default defineConfig({
  // Multi-file schema: one .prisma file per module (see docs/database.md).
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations should use a non-pooled connection on Neon. DIRECT_URL is our own name;
    // DATABASE_URL_UNPOOLED is what the Vercel–Neon integration provides.
    url:
      process.env.DIRECT_URL ?? process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
  },
});
