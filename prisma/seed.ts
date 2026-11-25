/**
 * Seed data for LOCAL and STAGING databases. OWNER: infra (team lead).
 *
 *   pnpm db:seed
 *
 * Idempotent: running it again updates the same rows instead of duplicating them.
 * It refuses to run against production. Each module owner may add their own demo rows
 * in the marked section for their module.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { config as loadEnv } from "dotenv";
import { PrismaClient } from "../src/generated/prisma/client";

loadEnv({ path: [".env.local", ".env"], quiet: true });

const APP_ENV = process.env.APP_ENV ?? "local";
if (APP_ENV !== "local" && APP_ENV !== "staging") {
  throw new Error(
    `Refusing to seed: APP_ENV is "${APP_ENV}". Seeding is for local and staging only.`,
  );
}
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set.");

/** Demo credentials: fixed defaults on a developer machine, required secrets on staging. */
function demoSecret(name: string, localDefault: string): string {
  const value = process.env[name];
  if (value) return value;
  if (APP_ENV === "local") return localDefault;
  throw new Error(`${name} must be set to seed a ${APP_ENV} database.`);
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const ADMIN_PHONE = "0800000001";
const USER_PHONE = "0800000002";

async function seedIdentity() {
  const center = await db.center.upsert({
    where: { code: "DEMO-01" },
    update: {},
    create: {
      code: "DEMO-01",
      name: "ศูนย์ชุมชนตัวอย่าง",
      address: "ข้อมูลสมมติสำหรับการพัฒนา",
      province: "ชลบุรี",
    },
  });

  const admin = await db.user.upsert({
    where: { phone: ADMIN_PHONE },
    update: {},
    create: {
      phone: ADMIN_PHONE,
      firstName: "ผู้ดูแล",
      lastName: "ตัวอย่าง",
      role: "ADMIN",
      credentialType: "PASSWORD",
      credentialHash: await bcrypt.hash(
        demoSecret("SEED_ADMIN_PASSWORD", "brain9-local-admin"),
        10,
      ),
      credentialUpdatedAt: new Date(),
    },
  });

  const elder = await db.user.upsert({
    where: { phone: USER_PHONE },
    update: {},
    create: {
      phone: USER_PHONE,
      firstName: "สมศรี",
      lastName: "ตัวอย่าง",
      role: "USER",
      credentialType: "PIN",
      credentialHash: await bcrypt.hash(demoSecret("SEED_USER_PIN", "1234"), 10),
      credentialUpdatedAt: new Date(),
      birthDate: new Date("1955-04-12"),
      gender: "FEMALE",
      homeCenterId: center.id,
    },
  });

  const effectiveAt = new Date("2026-11-23T00:00:00+07:00");
  for (const policy of [
    { type: "PRIVACY_NOTICE" as const, title: "ประกาศความเป็นส่วนตัว (ฉบับร่างสำหรับพัฒนา)" },
    { type: "TERMS_OF_USE" as const, title: "นโยบายการใช้งาน (ฉบับร่างสำหรับพัฒนา)" },
  ]) {
    await db.policyDocument.upsert({
      where: { type_version: { type: policy.type, version: "0.1.0" } },
      update: {},
      create: {
        type: policy.type,
        version: "0.1.0",
        title: policy.title,
        summary: "ข้อความตัวอย่าง — เจ้าของโมดูล identity จะจัดทำฉบับจริง",
        content: "PLACEHOLDER — replace with the reviewed text before real users sign up.",
        effectiveAt,
        publishedAt: effectiveAt,
        publishedById: admin.id,
      },
    });
  }

  return { admin, elder, center };
}

async function seedContent(adminId: string) {
  const existing = await db.course.findFirst({ where: { title: "คอร์สเริ่มต้น (ตัวอย่าง)" } });
  if (existing) return;

  await db.course.create({
    data: {
      title: "คอร์สเริ่มต้น (ตัวอย่าง)",
      description: "จำลำดับสั้น ๆ บนตาราง 3x3",
      difficultyLevel: 1,
      status: "PUBLISHED",
      publishedAt: new Date(),
      createdById: adminId,
      exercises: {
        create: [
          {
            title: "แบบฝึกที่ 1: จำ 2 ช่อง",
            difficultyLevel: 1,
            status: "PUBLISHED",
            sortOrder: 1,
            createdById: adminId,
            patterns: {
              create: [
                {
                  sortOrder: 1,
                  steps: { v: 1, steps: [{ cells: [0] }, { cells: [4] }] },
                  sequenceLength: 2,
                  hasSimultaneous: false,
                  createdById: adminId,
                },
                {
                  sortOrder: 2,
                  steps: { v: 1, steps: [{ cells: [2] }, { cells: [6] }, { cells: [8] }] },
                  sequenceLength: 3,
                  hasSimultaneous: false,
                  createdById: adminId,
                },
                {
                  sortOrder: 3,
                  steps: { v: 1, steps: [{ cells: [1] }, { cells: [3, 5] }] },
                  sequenceLength: 2,
                  hasSimultaneous: true,
                  createdById: adminId,
                },
              ],
            },
          },
        ],
      },
    },
  });
}

async function seedAnalytics() {
  // PLACEHOLDER thresholds so the table is not empty. The analytics owner sets the real
  // criteria together with the Requirement Owner.
  const effectiveFrom = new Date("2026-11-23T00:00:00+07:00");
  const levels = [
    { level: 1, name: "ควรฝึกเพิ่ม", minAccuracyPct: 0, maxAvgResponseTimeMs: null },
    { level: 2, name: "พอใช้", minAccuracyPct: 50, maxAvgResponseTimeMs: null },
    { level: 3, name: "ดี", minAccuracyPct: 70, maxAvgResponseTimeMs: 8000 },
    { level: 4, name: "ดีมาก", minAccuracyPct: 90, maxAvgResponseTimeMs: 5000 },
  ];
  for (const criterion of levels) {
    await db.performanceLevelCriterion.upsert({
      where: {
        level_difficultyLevel_effectiveFrom: {
          level: criterion.level,
          difficultyLevel: 0,
          effectiveFrom,
        },
      },
      update: {},
      create: { ...criterion, difficultyLevel: 0, effectiveFrom },
    });
  }
}

async function main() {
  const { admin } = await seedIdentity();
  await seedContent(admin.id);
  await seedAnalytics();
  // --- booking / engine demo rows: add here (module owners) ---

  const counts = {
    users: await db.user.count(),
    centers: await db.center.count(),
    courses: await db.course.count(),
    patterns: await db.pattern.count(),
  };
  console.log(`Seeded ${APP_ENV} database:`, counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
