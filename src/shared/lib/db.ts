import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "./env";

/**
 * The single PrismaClient for the whole app. Always import `db` from here —
 * creating another client opens another connection pool.
 */
function createClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: env().DATABASE_URL });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { __brain9Prisma?: PrismaClient };

export const db: PrismaClient = globalForPrisma.__brain9Prisma ?? createClient();

// Next.js dev mode reloads modules on every change; keep one client across reloads.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__brain9Prisma = db;
}

export type Db = PrismaClient;
/** Use for functions that must run inside an interactive transaction. */
export type DbTransaction = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];
